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
        var txt = '';
        var errortxt = '';
        var errortype = '';
        var errorstack = '';
        var internalid = null;
        if (_e instanceof nlobjError) {
            internalid = _e.getId();
            errortype = 'NLAPI Error';
            errortxt = _e.getCode()+' :: '+_e.getDetails();
            if(include_stacktrace) errorstack = _e.getStackTrace().join(', ');
        } else {
            errortype = 'Javascript Error';
            errortxt = _e.toString();
            if(include_stacktrace) errorstack= _e.stack;
        }
        
        txt = errortype+': ';
        if(internalid) txt += 'Record ID '+internalid+' :: ';
        txt += errortxt;
        if(errorstack) txt += ' :: Stack '+ errorstack;

        return txt;
    }

    return exports;
});