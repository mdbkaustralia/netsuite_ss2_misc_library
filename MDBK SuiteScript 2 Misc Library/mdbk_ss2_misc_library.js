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
 define(['N/runtime','N/task','N/search','N/record'], function (runtime,task,search,record) {
    var exports = {};
    var GOVERNANCE_THRESHOLD = 100;
    var RESCHEDULE_COMPLETE = false;

    /**
     * @typedef {Object} NetsuiteFileDefinition
     * @property {string} typeid - NetSuite's internal file type name
     * @property {string} name - A user-readable file type name
     * @property {string} extension - The file extension (including the ".")
     * @property {string} contentType - The file mime type
     * @property {number} internalid - NetSuite's Internal Id for the file type
     */
    /** @type {NetsuiteFileDefinition} */
    const NSFILETYPES = {
        'AUTOCAD' : {typeid : 'AUTOCAD', name : 'AutoCad', extension : '.dwg', contentType : 'application/x-autocad', internalid : 34},
        'BMPIMAGE' : {typeid : 'BMPIMAGE', name : 'BMP Image', extension : '.bmp', contentType : 'image/x-xbitmap', internalid : 6},
        'CSV' : {typeid : 'CSV', name : 'CSV File', extension : '.csv', contentType : 'text/csv', internalid : 14},
        'EXCEL' : {typeid : 'EXCEL', name : 'Excel File', extension : '.xls', contentType : 'application/vnd.ms-excel', internalid : 22},
        'FLASH' : {typeid : 'FLASH', name : 'Flash Animation', extension : '.swf', contentType : 'application/x-shockwave-flash', internalid : 1},
        'GIFIMAGE' : {typeid : 'GIFIMAGE', name : 'GIF Image', extension : '.gif', contentType : 'image/gif', internalid : 4},
        'GZIP' : {typeid : 'GZIP', name : 'GNU Zip File', extension : '.gz', contentType : 'application/x-gzip-compressed', internalid : 27},
        'HTMLDOC' : {typeid : 'HTMLDOC', name : 'HTML File', extension : '.htm', contentType : 'text/html', internalid : 9},
        'ICON' : {typeid : 'ICON', name : 'Icon Image', extension : '.ico', contentType : 'image/ico', internalid : 8},
        'JAVASCRIPT' : {typeid : 'JAVASCRIPT', name : 'JavaScript File', extension : '.js', contentType : 'text/javascript', internalid : 13},
        'JPGIMAGE' : {typeid : 'JPGIMAGE', name : 'JPEG Image', extension : '.jpg', contentType : 'image/jpeg', internalid : 2},
        'JSON' : {typeid : 'JSON', name : 'JSON File', extension : '.json', contentType : 'application/json', internalid : 38},
        'MESSAGERFC' : {typeid : 'MESSAGERFC', name : 'Message RFC', extension : '.eml', contentType : 'message/rfc822', internalid : 35},
        'MP3' : {typeid : 'MP3', name : 'MP3 Audio', extension : '.mp3', contentType : 'audio/mpeg', internalid : 30},
        'MPEGMOVIE' : {typeid : 'MPEGMOVIE', name : 'MPEG Video', extension : '.mpg', contentType : 'video/mpeg', internalid : 29},
        'MSPROJECT' : {typeid : 'MSPROJECT', name : 'Project File', extension : '.mpp', contentType : 'application/vnd.ms-project', internalid : 25},
        'PDF' : {typeid : 'PDF', name : 'PDF File', extension : '.pdf', contentType : 'application/pdf', internalid : 17},
        'PJPGIMAGE' : {typeid : 'PJPGIMAGE', name : 'PJPEG Image', extension : '.pjpeg', contentType : 'image/pjpeg', internalid : 3},
        'PLAINTEXT' : {typeid : 'PLAINTEXT', name : 'Plain Text File', extension : '.txt', contentType : 'text/plain', internalid : 10},
        'PNGIMAGE' : {typeid : 'PNGIMAGE', name : 'PNG Image', extension : '.png', contentType : 'image/x-png', internalid : 5},
        'POSTSCRIPT' : {typeid : 'POSTSCRIPT', name : 'PostScript File', extension : '.ps', contentType : 'application/postscript', internalid : 21},
        'POWERPOINT' : {typeid : 'POWERPOINT', name : 'PowerPoint File', extension : '.ppt', contentType : 'application/vnd.ms-powerpoint', internalid : 23},
        'QUICKTIME' : {typeid : 'QUICKTIME', name : 'QuickTime Video', extension : '.mov', contentType : 'video/quicktime', internalid : 28},
        'RTF' : {typeid : 'RTF', name : 'RTF File', extension : '.rtf', contentType : 'application/rtf', internalid : 20},
        'SMS' : {typeid : 'SMS', name : 'SMS File', extension : '.sms', contentType : 'application/sms', internalid : 18},
        'STYLESHEET' : {typeid : 'STYLESHEET', name : 'CSS File', extension : '.css', contentType : 'text/css', internalid : 11},
        'TIFFIMAGE' : {typeid : 'TIFFIMAGE', name : 'TIFF Image', extension : '.tiff', contentType : 'image/tiff', internalid : 7},
        'VISIO' : {typeid : 'VISIO', name : 'Visio File', extension : '.vsd', contentType : 'application/vnd.visio', internalid : 24},
        'WORD' : {typeid : 'WORD', name : 'Word File', extension : '.doc', contentType : 'application/msword', internalid : 19},
        'XMLDOC' : {typeid : 'XMLDOC', name : 'XML File', extension : '.xml', contentType : 'text/xml', internalid : 12},
        'ZIP' : {typeid : 'ZIP', name : 'Zip File', extension : '.zip', contentType : 'application/zip', internalid : 26},
        'AutoCad' : {typeid : 'AUTOCAD', name : 'AutoCad', extension : '.dwg', contentType : 'application/x-autocad', internalid : 34},
        'BMP Image' : {typeid : 'BMPIMAGE', name : 'BMP Image', extension : '.bmp', contentType : 'image/x-xbitmap', internalid : 6},
        'CSV File' : {typeid : 'CSV', name : 'CSV File', extension : '.csv', contentType : 'text/csv', internalid : 14},
        'Excel File' : {typeid : 'EXCEL', name : 'Excel File', extension : '.xls', contentType : 'application/vnd.ms-excel', internalid : 22},
        'Flash Animation' : {typeid : 'FLASH', name : 'Flash Animation', extension : '.swf', contentType : 'application/x-shockwave-flash', internalid : 1},
        'GIF Image' : {typeid : 'GIFIMAGE', name : 'GIF Image', extension : '.gif', contentType : 'image/gif', internalid : 4},
        'GNU Zip File' : {typeid : 'GZIP', name : 'GNU Zip File', extension : '.gz', contentType : 'application/x-gzip-compressed', internalid : 27},
        'HTML File' : {typeid : 'HTMLDOC', name : 'HTML File', extension : '.htm', contentType : 'text/html', internalid : 9},
        'Icon Image' : {typeid : 'ICON', name : 'Icon Image', extension : '.ico', contentType : 'image/ico', internalid : 8},
        'JavaScript File' : {typeid : 'JAVASCRIPT', name : 'JavaScript File', extension : '.js', contentType : 'text/javascript', internalid : 13},
        'JPEG Image' : {typeid : 'JPGIMAGE', name : 'JPEG Image', extension : '.jpg', contentType : 'image/jpeg', internalid : 2},
        'JPEG Image2' : {typeid : 'JPGIMAGE', name : 'JPEG Image', extension : '.jpeg', contentType : 'image/jpeg', internalid : 2},
        'JSON File' : {typeid : 'JSON', name : 'JSON File', extension : '.json', contentType : 'application/json', internalid : 38},
        'Message RFC' : {typeid : 'MESSAGERFC', name : 'Message RFC', extension : '.eml', contentType : 'message/rfc822', internalid : 35},
        'MP3 Audio' : {typeid : 'MP3', name : 'MP3 Audio', extension : '.mp3', contentType : 'audio/mpeg', internalid : 30},
        'MPEG Video' : {typeid : 'MPEGMOVIE', name : 'MPEG Video', extension : '.mpg', contentType : 'video/mpeg', internalid : 29},
        'Project File' : {typeid : 'MSPROJECT', name : 'Project File', extension : '.mpp', contentType : 'application/vnd.ms-project', internalid : 25},
        'PDF File' : {typeid : 'PDF', name : 'PDF File', extension : '.pdf', contentType : 'application/pdf', internalid : 17},
        'PJPEG Image' : {typeid : 'PJPGIMAGE', name : 'PJPEG Image', extension : '.pjpeg', contentType : 'image/pjpeg', internalid : 3},
        'Plain Text File' : {typeid : 'PLAINTEXT', name : 'Plain Text File', extension : '.txt', contentType : 'text/plain', internalid : 10},
        'PNG Image' : {typeid : 'PNGIMAGE', name : 'PNG Image', extension : '.png', contentType : 'image/x-png', internalid : 5},
        'PostScript File' : {typeid : 'POSTSCRIPT', name : 'PostScript File', extension : '.ps', contentType : 'application/postscript', internalid : 21},
        'PowerPoint File' : {typeid : 'POWERPOINT', name : 'PowerPoint File', extension : '.ppt', contentType : 'application/vnd.ms-powerpoint', internalid : 23},
        'QuickTime Video' : {typeid : 'QUICKTIME', name : 'QuickTime Video', extension : '.mov', contentType : 'video/quicktime', internalid : 28},
        'RTF File' : {typeid : 'RTF', name : 'RTF File', extension : '.rtf', contentType : 'application/rtf', internalid : 20},
        'SMS File' : {typeid : 'SMS', name : 'SMS File', extension : '.sms', contentType : 'application/sms', internalid : 18},
        'CSS File' : {typeid : 'STYLESHEET', name : 'CSS File', extension : '.css', contentType : 'text/css', internalid : 11},
        'TIFF Image' : {typeid : 'TIFFIMAGE', name : 'TIFF Image', extension : '.tiff', contentType : 'image/tiff', internalid : 7},
        'Visio File' : {typeid : 'VISIO', name : 'Visio File', extension : '.vsd', contentType : 'application/vnd.visio', internalid : 24},
        'Word File' : {typeid : 'WORD', name : 'Word File', extension : '.doc', contentType : 'application/msword', internalid : 19},
        'XML File' : {typeid : 'XMLDOC', name : 'XML File', extension : '.xml', contentType : 'text/xml', internalid : 12},
        'Zip File' : {typeid : 'ZIP', name : 'Zip File', extension : '.zip', contentType : 'application/zip', internalid : 26},
        };

    /**
     * Takes in a thrown error and returns a string containing the error name, error message, and optionally the stacktrace.
     * @param {object} _e A Javascript or SuiteScript error.
     * @param {boolean} include_stacktrace Whether or not to include the stacktrace in the returned error string.
     * @returns {string} Returns a string containing the error name, error message, and stacktrace. 
     */
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

    /**
     * Takes in a user defined value and returns it, or the default_input otherwise.
     * Also works for NetSuite checkboxes with true/false or T/F values.
     * @param {string|boolean} user_input 
     * @param {string|boolean} default_input 
     * @returns {string} Returns "T" or "F"
     */
    exports.getUserInputOrDefault = function(user_input, default_input) {
        if(user_input != null) {
            if(user_input == 'T' || user_input == 'true') return true;
            if(user_input == 'F' || user_input == 'false') return false;
            return user_input;
        }
        return default_input;
    }

    /**
     * Checks if the input string is null or empty.
     * @param {string|boolean} str 
     * @returns {boolean} Returns TRUE or FALSE
     */
    exports.isEmpty = function(str) {
        if(str == null || str == '') return true;
        return false;
    }

    /**
     * Checks if the input string is not null or empty.
     * @param {string|boolean} str 
     * @returns {boolean} Returns TRUE or FALSE
     */
    exports.isNotEmpty = function(str) {
        return !this.isEmpty(str);
    }

    /**
     * Accepts a Netsuite search.Search object and returns an array containing all the results (not limited to first 1000 rows.) 
     * @param {search.Search} search A NetSuite search object (returned from search.create or search.load) 
     * @returns {array} Returns an array containing all search results
     */
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
     * Accepts a Netsuite search.ResultSet object and returns a javascript array object containing all the results. 
     * @param {search.ResultSet} searchresults A NetSuite search.ResultSet object or array of search.Result records.
     * @returns {array} Returns an array containing all search results
     */
    exports.searchResultsArray = function(searchresults) {
        var ResultsArray = [];
        if(!searchresults || !searchresults[0] || typeof searchresults[0].columns == 'undefined') return ResultsArray;
        
        var ResultsColumns = searchresults[0].columns;
        for(var c=0;c<ResultsColumns.length;c++) {
            ResultsColumns[c].label_or_name = (ResultsColumns[c].label != '' ? ResultsColumns[c].label : ResultsColumns[c].name);
        }
        for(var i=0;i<searchresults.length;i++) {
            var row = searchresults[i];
            var rowData = {};
            for(var c=0;c<ResultsColumns.length;c++) {
                rowData[ResultsColumns[c].label_or_name+'_value'] = row.getValue(ResultsColumns[c]);
                rowData[ResultsColumns[c].label_or_name+'_text'] = row.getText(ResultsColumns[c]);
            }
            ResultsArray.push(rowData);
        }
        return ResultsArray;
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

    /**
     * Accepts a filename (with extension) and returns an object containing the NetSuite file type definition.
     * @param {string} filename A file name
     * @returns {NetsuiteFileDefinition} The NetSuite file type definition
     */
    exports.getNSFileType = function(filename) {
        filename = filename.toLowerCase();
        var myregexp = /(?:\.|^)(\w+)$/im;
        var match = myregexp.exec(filename);
        if (match != null) {
            extension = match[1];
        } else {
            return null;
        }
        return exports.findKeyInObjectByFieldValue(NSFILETYPES,'extension','.'+extension);
    }

    /**
     * Finds and returns the contents of a key that contains a matching property/value combination.
     * @param {object} obj An object/array
     * @param {string} property The field/property to search inside
     * @param {string} value The value that must be found inside the property
     * @returns {object|null} The matching object, or null.
     */
    exports.findKeyInObjectByFieldValue = function(obj,property,value) {
        var entries = Object.keys(obj);
        for(var i=0,total=entries.length;i<total;i++) {
            if(obj[entries[i]][property] == value) return obj[entries[i]];
        }
        return null;
    }

    /**
     * Takes a NetSuite file cabinet folder path and returns the internal id. Will create the folder if it does not already exist.
     * @param {string} path A NetSuite file cabinet folder path
     * @param {string} parentId Used internally by the function
     * @returns {number} The internal id of the matching folder
     */
    exports.getFolderId = function(path,parentId) {
        var pieces = path.split(/[\\\/]/im);
        var piece = pieces.shift()

        if(exports.isEmpty(parentId)) parentId = '@NONE@';

        var filtersArray = [
            ['name',search.Operator.IS,piece],
            'AND',
            ['parent',search.Operator.ANYOF,parentId]
        ];
        var folderSearch = search.create({
            type: search.Type.FOLDER,
            filters: filtersArray,
        });
        var folderResultSet = folderSearch.run();
        var folderRange = folderResultSet.getRange({
            start: 0,
            end: 1
        });
        var folderId = 0;
        if(folderRange.length == 1) folderId = folderRange[0].id;

        if(folderId == 0) {
            var folderRec = record.create({
                type: record.Type.FOLDER
            });
            folderRec.setValue({
                fieldId: 'name',
                value: piece
            });
            if(parentId != '@NONE@') {
                folderRec.setValue({
                    fieldId: 'parent',
                    value: parentId
                });
            } else {
                folderRec.setValue({
                    fieldId: 'parent',
                    value: ''
                });
            }
            folderId = folderRec.save();
        }

        if(pieces.length == 0) return folderId;
        return exports.getFolderId(pieces.join('/'),folderId);
    }

    return exports;
});