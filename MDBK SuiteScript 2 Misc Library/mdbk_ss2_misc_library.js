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
define([], function () {
    var exports = {};

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

    exports.getTorF = function(input) {
        if(input == 'T' || input === true) return 'T';
        return 'F';
    }

    return exports;
});