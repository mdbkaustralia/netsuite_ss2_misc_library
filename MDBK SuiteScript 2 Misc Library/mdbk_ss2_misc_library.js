/**
 * MDBK SuiteScript 2 Miscellaneous Functions Library
 * Copyright (c) 2020 MDBK Australia
 * 
 * For complete list of authors, please refer to https://github.com/mdbkaustralia/netsuite_ss2_misc_library
 * 
 * MDBK SuiteScript 2 Miscellaneous Functions Library is distributed under the MIT License.
 * 
 * @NApiVersion 2.0
 */
define(['N/runtime','N/task'], function (runtime,task) {
    var exports = {};
    var GOVERNANCE_THRESHOLD = 100;
    var RESCHEDULE_COMPLETE = false;

    exports.errorText = function(_e, include_stacktrace) {
        if(typeof _e == 'string') return _e;
        var txt = '';
        var errortxt = '';
        var errortype = '';
        var errorstack = '';
        var internalid = null;
        if (_e.constructor.name == 'SuiteScriptError') {
            internalid = _e.recordId;
            errortype = 'NLAPI Error';
            errortxt = _e.name+': '+_e.message;
            if(include_stacktrace) errorstack = _e.stack.join(', ');
        } else {
            errortype = 'Javascript Error';
            errortxt = _e.toString();
            if(include_stacktrace) errorstack= _e.stack;
        }
        
        txt = errortype+' | ';
        if(internalid) txt += 'Record ID: '+internalid+' | ';
        txt += errortxt;
        if(errorstack) txt += ' | Stack: '+ errorstack;

        return txt;
    }

    /**
     * Takes in a value from a NetSuite checkbox, whether it be a string ("T" or "F") or a boolean, and returns a string of either "T" or "F"
     * @param {string|boolean} input 
     * @returns {string} Returns "T" or "F"
     */
    exports.getTorF = function(input) {
        if(input == 'T' || input === true) return 'T';
        return 'F';
    }

    exports.getAllSearchResults = function(search) {
        var returnSearchResults = [];
        var resultSet = search.run();
        var searchi=0;
        do {
            var resultslice = resultSet.getRange(searchi, (searchi+1000));
            for (var rs in resultslice) {
                returnSearchResults.push(resultslice[rs]);
                searchi++;
            }
        } while (resultslice.length >= 1000);

        return returnSearchResults;
    }

    /**
     * Check if there is still remaining usage compared to the set goverernace threshold, and re-schedules the script if required.
     * Returns true if usage still remains, otherwise returns false.
     * @param {object} [object] An object containing the scriptId and deploymentId of the script to reschedule (defaults to current script)
     * @param {string} [object.scriptId] The script ID of the script to reschedule (defaults to current script)
     * @param {string} [object.deploymentId] The deployment ID of the script to reschedule (defaults to current script deployment)
     * @param {object} [object.params] The parameters to pass to the script (TODO: defaults to current script parameters)
     * @param {boolean} [object.useContinue] If set to true, will replace "1" at the end of a deployment ID with "2" (useful if deployment ID ending in "1" is scheduled, and "2" is a not-scheduled ad-hoc deployment)
     * @param {boolean} [object.force] If set to true, will attempt a schedule without checking usage
     * @returns {boolean} Returns true if governance threshold has not been reached, or if re-schedule failed.
     * Returns false if script governance is exceeded and re-schedule was successful
     */
    exports.checkGovernance = function(object) {
        if(RESCHEDULE_COMPLETE) return false;
        var scriptObj = runtime.getCurrentScript();
        var object = object || {};
        var scriptId = object.scriptId || scriptObj.id;
        var deploymentId = object.deploymentId || scriptObj.deploymentId;
        var params = object.params || {};
        // TODO: default params to current script parameters
        if(object.useContinue == true && deploymentId.substr(-1) == '1') deploymentId = deploymentId.substr(0,(deploymentId.length-1))+'2';
        var remaining = scriptObj.getRemainingUsage();
        if(!object.force && remaining>GOVERNANCE_THRESHOLD) return true;

        var scheduledTask = task.create({
            taskType: task.TaskType.SCHEDULED_SCRIPT,
            scriptId: scriptId,
            deploymentId: deploymentId,
            params: params
        });
        try {
            scheduledTask.submit();
            RESCHEDULE_COMPLETE = true;
            return false;
        } catch(e) {
            log.error({
                title: 'checkGovernance: Failed to schedule script',
                details: exports.errorText(e)
            });
            return true;
        }
    }

    /**
     * Set the minimum remaining usage threshold which is used by the "checkGovernance" function.
     * @param {number} value The minimum acceptable remaining usage before triggering a reschedule
     * @returns void
     */
    exports.setGovernanceThreshold = function(value) {
        GOVERNANCE_THRESHOLD = value;
    }

    return exports;
});