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
define(['N/runtime', 'N/task', 'N/search', 'N/record', 'N/log'], function (runtime, task, search, record, log) {

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

    /**
     * Mapping of NetSuite file types to their definitions.
     * Keys can be either the type ID (e.g., "JAVASCRIPT") or the user-readable name (e.g., "JavaScript File").
     * @type {Object.<string, NetsuiteFileDefinition>}
     */
    const NSFILETYPES = {
        'AUTOCAD': { typeid: 'AUTOCAD', name: 'AutoCad', extension: '.dwg', contentType: 'application/x-autocad', internalid: 34 },
        'BMPIMAGE': { typeid: 'BMPIMAGE', name: 'BMP Image', extension: '.bmp', contentType: 'image/x-xbitmap', internalid: 6 },
        'CSV': { typeid: 'CSV', name: 'CSV File', extension: '.csv', contentType: 'text/csv', internalid: 14 },
        'EXCEL': { typeid: 'EXCEL', name: 'Excel File', extension: '.xls', contentType: 'application/vnd.ms-excel', internalid: 22 },
        'FLASH': { typeid: 'FLASH', name: 'Flash Animation', extension: '.swf', contentType: 'application/x-shockwave-flash', internalid: 1 },
        'GIFIMAGE': { typeid: 'GIFIMAGE', name: 'GIF Image', extension: '.gif', contentType: 'image/gif', internalid: 4 },
        'GZIP': { typeid: 'GZIP', name: 'GNU Zip File', extension: '.gz', contentType: 'application/x-gzip-compressed', internalid: 27 },
        'HTMLDOC': { typeid: 'HTMLDOC', name: 'HTML File', extension: '.htm', contentType: 'text/html', internalid: 9 },
        'ICON': { typeid: 'ICON', name: 'Icon Image', extension: '.ico', contentType: 'image/ico', internalid: 8 },
        'JAVASCRIPT': { typeid: 'JAVASCRIPT', name: 'JavaScript File', extension: '.js', contentType: 'text/javascript', internalid: 13 },
        'JPGIMAGE': { typeid: 'JPGIMAGE', name: 'JPEG Image', extension: '.jpg', contentType: 'image/jpeg', internalid: 2 },
        'JSON': { typeid: 'JSON', name: 'JSON File', extension: '.json', contentType: 'application/json', internalid: 38 },
        'MESSAGERFC': { typeid: 'MESSAGERFC', name: 'Message RFC', extension: '.eml', contentType: 'message/rfc822', internalid: 35 },
        'MP3': { typeid: 'MP3', name: 'MP3 Audio', extension: '.mp3', contentType: 'audio/mpeg', internalid: 30 },
        'MPEGMOVIE': { typeid: 'MPEGMOVIE', name: 'MPEG Video', extension: '.mpg', contentType: 'video/mpeg', internalid: 29 },
        'MSPROJECT': { typeid: 'MSPROJECT', name: 'Project File', extension: '.mpp', contentType: 'application/vnd.ms-project', internalid: 25 },
        'PDF': { typeid: 'PDF', name: 'PDF File', extension: '.pdf', contentType: 'application/pdf', internalid: 17 },
        'PJPGIMAGE': { typeid: 'PJPGIMAGE', name: 'PJPEG Image', extension: '.pjpeg', contentType: 'image/pjpeg', internalid: 3 },
        'PLAINTEXT': { typeid: 'PLAINTEXT', name: 'Plain Text File', extension: '.txt', contentType: 'text/plain', internalid: 10 },
        'PNGIMAGE': { typeid: 'PNGIMAGE', name: 'PNG Image', extension: '.png', contentType: 'image/x-png', internalid: 5 },
        'POSTSCRIPT': { typeid: 'POSTSCRIPT', name: 'PostScript File', extension: '.ps', contentType: 'application/postscript', internalid: 21 },
        'POWERPOINT': { typeid: 'POWERPOINT', name: 'PowerPoint File', extension: '.ppt', contentType: 'application/vnd.ms-powerpoint', internalid: 23 },
        'QUICKTIME': { typeid: 'QUICKTIME', name: 'QuickTime Video', extension: '.mov', contentType: 'video/quicktime', internalid: 28 },
        'RTF': { typeid: 'RTF', name: 'RTF File', extension: '.rtf', contentType: 'application/rtf', internalid: 20 },
        'SMS': { typeid: 'SMS', name: 'SMS File', extension: '.sms', contentType: 'application/sms', internalid: 18 },
        'STYLESHEET': { typeid: 'STYLESHEET', name: 'CSS File', extension: '.css', contentType: 'text/css', internalid: 11 },
        'TIFFIMAGE': { typeid: 'TIFFIMAGE', name: 'TIFF Image', extension: '.tiff', contentType: 'image/tiff', internalid: 7 },
        'VISIO': { typeid: 'VISIO', name: 'Visio File', extension: '.vsd', contentType: 'application/vnd.visio', internalid: 24 },
        'WORD': { typeid: 'WORD', name: 'Word File', extension: '.doc', contentType: 'application/msword', internalid: 19 },
        'XMLDOC': { typeid: 'XMLDOC', name: 'XML File', extension: '.xml', contentType: 'text/xml', internalid: 12 },
        'ZIP': { typeid: 'ZIP', name: 'Zip File', extension: '.zip', contentType: 'application/zip', internalid: 26 },
        'AutoCad': { typeid: 'AUTOCAD', name: 'AutoCad', extension: '.dwg', contentType: 'application/x-autocad', internalid: 34 },
        'BMP Image': { typeid: 'BMPIMAGE', name: 'BMP Image', extension: '.bmp', contentType: 'image/x-xbitmap', internalid: 6 },
        'CSV File': { typeid: 'CSV', name: 'CSV File', extension: '.csv', contentType: 'text/csv', internalid: 14 },
        'Excel File': { typeid: 'EXCEL', name: 'Excel File', extension: '.xls', contentType: 'application/vnd.ms-excel', internalid: 22 },
        'Flash Animation': { typeid: 'FLASH', name: 'Flash Animation', extension: '.swf', contentType: 'application/x-shockwave-flash', internalid: 1 },
        'GIF Image': { typeid: 'GIFIMAGE', name: 'GIF Image', extension: '.gif', contentType: 'image/gif', internalid: 4 },
        'GNU Zip File': { typeid: 'GZIP', name: 'GNU Zip File', extension: '.gz', contentType: 'application/x-gzip-compressed', internalid: 27 },
        'HTML File': { typeid: 'HTMLDOC', name: 'HTML File', extension: '.htm', contentType: 'text/html', internalid: 9 },
        'Icon Image': { typeid: 'ICON', name: 'Icon Image', extension: '.ico', contentType: 'image/ico', internalid: 8 },
        'JavaScript File': { typeid: 'JAVASCRIPT', name: 'JavaScript File', extension: '.js', contentType: 'text/javascript', internalid: 13 },
        'JPEG Image': { typeid: 'JPGIMAGE', name: 'JPEG Image', extension: '.jpg', contentType: 'image/jpeg', internalid: 2 },
        'JPEG Image2': { typeid: 'JPGIMAGE', name: 'JPEG Image', extension: '.jpeg', contentType: 'image/jpeg', internalid: 2 },
        'JSON File': { typeid: 'JSON', name: 'JSON File', extension: '.json', contentType: 'application/json', internalid: 38 },
        'Message RFC': { typeid: 'MESSAGERFC', name: 'Message RFC', extension: '.eml', contentType: 'message/rfc822', internalid: 35 },
        'MP3 Audio': { typeid: 'MP3', name: 'MP3 Audio', extension: '.mp3', contentType: 'audio/mpeg', internalid: 30 },
        'MPEG Video': { typeid: 'MPEGMOVIE', name: 'MPEG Video', extension: '.mpg', contentType: 'video/mpeg', internalid: 29 },
        'Project File': { typeid: 'MSPROJECT', name: 'Project File', extension: '.mpp', contentType: 'application/vnd.ms-project', internalid: 25 },
        'PDF File': { typeid: 'PDF', name: 'PDF File', extension: '.pdf', contentType: 'application/pdf', internalid: 17 },
        'PJPEG Image': { typeid: 'PJPGIMAGE', name: 'PJPEG Image', extension: '.pjpeg', contentType: 'image/pjpeg', internalid: 3 },
        'Plain Text File': { typeid: 'PLAINTEXT', name: 'Plain Text File', extension: '.txt', contentType: 'text/plain', internalid: 10 },
        'PNG Image': { typeid: 'PNGIMAGE', name: 'PNG Image', extension: '.png', contentType: 'image/x-png', internalid: 5 },
        'PostScript File': { typeid: 'POSTSCRIPT', name: 'PostScript File', extension: '.ps', contentType: 'application/postscript', internalid: 21 },
        'PowerPoint File': { typeid: 'POWERPOINT', name: 'PowerPoint File', extension: '.ppt', contentType: 'application/vnd.ms-powerpoint', internalid: 23 },
        'QuickTime Video': { typeid: 'QUICKTIME', name: 'QuickTime Video', extension: '.mov', contentType: 'video/quicktime', internalid: 28 },
        'RTF File': { typeid: 'RTF', name: 'RTF File', extension: '.rtf', contentType: 'application/rtf', internalid: 20 },
        'SMS File': { typeid: 'SMS', name: 'SMS File', extension: '.sms', contentType: 'application/sms', internalid: 18 },
        'CSS File': { typeid: 'STYLESHEET', name: 'CSS File', extension: '.css', contentType: 'text/css', internalid: 11 },
        'TIFF Image': { typeid: 'TIFFIMAGE', name: 'TIFF Image', extension: '.tiff', contentType: 'image/tiff', internalid: 7 },
        'Visio File': { typeid: 'VISIO', name: 'Visio File', extension: '.vsd', contentType: 'application/vnd.visio', internalid: 24 },
        'Word File': { typeid: 'WORD', name: 'Word File', extension: '.doc', contentType: 'application/msword', internalid: 19 },
        'XML File': { typeid: 'XMLDOC', name: 'XML File', extension: '.xml', contentType: 'text/xml', internalid: 12 },
        'Zip File': { typeid: 'ZIP', name: 'Zip File', extension: '.zip', contentType: 'application/zip', internalid: 26 },
    };

    /**
     * Takes in a thrown error and returns a string containing the error name, error message, and optionally the stacktrace.
     * @param {Error|SuiteScriptError|string} _e A Javascript or SuiteScript error, or a plain error string.
     * @param {boolean} [include_stacktrace=false] Whether or not to include the stacktrace in the returned error string.
     * @returns {string} Returns a formatted string containing the error type, message, and optionally the stacktrace.
     */
    exports.errorText = function (_e, include_stacktrace) {
        if (typeof _e == 'string') return _e;
        var txt = '';
        var errortxt = '';
        var errortype = '';
        var errorstack = '';
        var internalid = null;
        if (_e.constructor.name == 'SuiteScriptError') {
            internalid = _e.recordId;
            errortype = 'NLAPI Error';
            errortxt = _e.name + ': ' + _e.message;
            if (include_stacktrace) errorstack = _e.stack.join(', ');
        } else {
            errortype = 'Javascript Error';
            errortxt = _e.toString();
            if (include_stacktrace) errorstack = _e.stack;
        }

        txt = errortype + ' | ';
        if (internalid) txt += 'Record ID: ' + internalid + ' | ';
        txt += errortxt;
        if (errorstack) txt += ' | Stack: ' + errorstack;

        return txt;
    }

    /**
     * Normalises a NetSuite checkbox value (boolean or "T"/"F" string) to a canonical "T" or "F" string.
     * @param {string|boolean} input A checkbox value: true, false, "T", or "F".
     * @returns {string} Returns "T" or "F".
     */
    exports.getTorF = function (input) {
        if (input == 'T' || input === true) return 'T';
        return 'F';
    }

    /**
     * Returns user_input if it is not null, otherwise returns default_input.
     * Coerces "T"/"true" to true and "F"/"false" to false for NetSuite checkbox compatibility.
     * @param {string|boolean|null} user_input The user-supplied value, or null if not provided.
     * @param {*} default_input The fallback value to return when user_input is null.
     * @returns {*} The coerced user_input value, or default_input if user_input is null.
     */
    exports.getUserInputOrDefault = function (user_input, default_input) {
        if (user_input != null) {
            if (user_input == 'T' || user_input == 'true') return true;
            if (user_input == 'F' || user_input == 'false') return false;
            return user_input;
        }
        return default_input;
    }

    /**
     * Returns true if the value is null or an empty string.
     * @param {*} str The value to test.
     * @returns {boolean} True if null or "", false otherwise.
     */
    exports.isEmpty = function (str) {
        if (str == null || str == '') return true;
        return false;
    }

    /**
     * Returns true if the value is neither null nor an empty string.
     * @param {*} str The value to test.
     * @returns {boolean} True if non-null and non-empty, false otherwise.
     */
    exports.isNotEmpty = function (str) {
        return !this.isEmpty(str);
    }

    /**
     * Runs a NetSuite saved search and returns all results, bypassing the 1000-row limit.
     * @param {search.Search} searchObj A NetSuite search object returned from search.create or search.load.
     * @returns {search.Result[]} An array of all matching search.Result objects.
     */
    exports.getAllSearchResults = function (searchObj) {
        var returnSearchResults = [];
        var resultSet = searchObj.run();
        var searchi = 0;
        do {
            var resultslice = resultSet.getRange(searchi, (searchi + 1000));
            for (var rs in resultslice) {
                returnSearchResults.push(resultslice[rs]);
                searchi++;
            }
        } while (resultslice.length >= 1000);

        return returnSearchResults;
    }

    /**
     * Converts a NetSuite search.ResultSet (or search.Result array) into a plain array of key/value objects.
     * Each row object contains keys in the form "<columnLabelOrName>_value" and "<columnLabelOrName>_text".
     * @param {search.Result[]} searchresults An array of search.Result objects.
     * @returns {Object[]} An array of plain objects, one per result row.
     */
    exports.searchResultsArray = function (searchresults) {
        var ResultsArray = [];
        if (!searchresults || !searchresults[0] || typeof searchresults[0].columns == 'undefined') return ResultsArray;

        var ResultsColumns = searchresults[0].columns;
        for (var c = 0; c < ResultsColumns.length; c++) {
            ResultsColumns[c].label_or_name = (ResultsColumns[c].label != '' ? ResultsColumns[c].label : ResultsColumns[c].name);
        }
        for (var i = 0; i < searchresults.length; i++) {
            var row = searchresults[i];
            var rowData = {};
            for (var c = 0; c < ResultsColumns.length; c++) {
                rowData[ResultsColumns[c].label_or_name + '_value'] = row.getValue(ResultsColumns[c]);
                rowData[ResultsColumns[c].label_or_name + '_text'] = row.getText(ResultsColumns[c]);
            }
            ResultsArray.push(rowData);
        }
        return ResultsArray;
    }

    /**
     * Checks remaining script governance against GOVERNANCE_THRESHOLD and reschedules the script if the threshold is reached.
     * @param {Object} [object] Options controlling which script/deployment to reschedule.
     * @param {string} [object.scriptId] Script ID of the script to reschedule (defaults to current script).
     * @param {string} [object.deploymentId] Deployment ID to reschedule (defaults to current deployment).
     * @param {Object} [object.params] Parameters to pass to the rescheduled script.
     * @param {boolean} [object.useContinue] When true, replaces a trailing "1" in the deploymentId with "2".
     * @param {boolean} [object.force] When true, reschedules without checking remaining usage.
     * @returns {boolean} True if governance threshold has NOT been reached (or if rescheduling failed); false if the script was successfully rescheduled.
     */
    exports.checkGovernance = function (object) {
        if (RESCHEDULE_COMPLETE) return false;
        var scriptObj = runtime.getCurrentScript();
        var object = object || {};
        var scriptId = object.scriptId || scriptObj.id;
        var deploymentId = object.deploymentId || scriptObj.deploymentId;
        var params = object.params || {};
        // TODO: default params to current script parameters
        if (object.useContinue == true && deploymentId.substr(-1) == '1') deploymentId = deploymentId.substr(0, (deploymentId.length - 1)) + '2';
        var remaining = scriptObj.getRemainingUsage();
        if (!object.force && remaining > GOVERNANCE_THRESHOLD) return true;

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
        } catch (e) {
            log.error({
                title: 'checkGovernance: Failed to schedule script',
                details: exports.errorText(e)
            });
            return true;
        }
    }

    /**
     * Sets the minimum remaining-usage threshold used by {@link checkGovernance}.
     * @param {number} value The minimum acceptable remaining usage before triggering a reschedule.
     * @returns {void}
     */
    exports.setGovernanceThreshold = function (value) {
        GOVERNANCE_THRESHOLD = value;
    }

    /**
     * Resolves a filename's extension to its NetSuite file type definition.
     * @param {string} filename A filename including its extension (e.g. "report.pdf").
     * @returns {NetsuiteFileDefinition|null} The matching NetSuite file type definition, or null if unrecognised.
     */
    exports.getNSFileType = function (filename) {
        filename = filename.toLowerCase();
        var myregexp = /(?:\.|^)(\w+)$/im;
        var match = myregexp.exec(filename);
        if (match != null) {
            extension = match[1];
        } else {
            return null;
        }
        return exports.findKeyInObjectByFieldValue(NSFILETYPES, 'extension', '.' + extension);
    }

    /**
     * Searches an object's values for the first entry whose named property equals the given value.
     * @param {Object} obj       The object whose values will be searched.
     * @param {string} property  The property name to compare on each value.
     * @param {*}      value     The value to match against.
     * @returns {Object|null} The first matching value object, or null if not found.
     */
    exports.findKeyInObjectByFieldValue = function (obj, property, value) {
        var entries = Object.keys(obj);
        for (var i = 0, total = entries.length; i < total; i++) {
            if (obj[entries[i]][property] == value) return obj[entries[i]];
        }
        return null;
    }

    /**
     * Resolves a file-cabinet folder path to its internal ID, creating missing folders along the way.
     * @param {string}        path     A slash- or backslash-separated folder path (e.g. "SuiteScripts/MyApp/Logs").
     * @param {number|string} [parentId] Internal ID of the parent folder; used by recursive calls (omit on first call).
     * @returns {number} The internal ID of the deepest folder in the path.
     */
    exports.getFolderId = function (path, parentId) {
        var pieces = path.split(/[\\\/]/im);
        var piece = pieces.shift()

        if (exports.isEmpty(parentId)) parentId = '@NONE@';

        var filtersArray = [
            ['name', search.Operator.IS, piece],
            'AND',
            ['parent', search.Operator.ANYOF, parentId]
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
        if (folderRange.length == 1) folderId = folderRange[0].id;

        if (folderId == 0) {
            var folderRec = record.create({
                type: record.Type.FOLDER
            });
            folderRec.setValue({
                fieldId: 'name',
                value: piece
            });
            if (parentId != '@NONE@') {
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

        if (pieces.length == 0) return folderId;
        return exports.getFolderId(pieces.join('/'), folderId);
    }

    /**
     * Tests whether a string is valid JSON.
     * @param {string} text The string to test.
     * @returns {boolean} True if the string can be parsed as JSON, false otherwise.
     */
    exports.isJson = function (text) {
        try {
            JSON.parse(text);
        } catch (e) {
            return false;
        }
        return true;
    }

    /**
     * Converts a weight amount between NetSuite weight units (lb, oz, kg, g).
     * @param {Object} object Conversion parameters.
     * @param {number} object.amount The quantity to convert.
     * @param {number|string} object.from Source unit: 1/"lb", 2/"oz", 3/"kg", or 4/"g" (NetSuite internal ID or name).
     * @param {number|string} object.to Target unit: 1/"lb", 2/"oz", 3/"kg", or 4/"g" (NetSuite internal ID or name).
     * @returns {number} The converted weight in the target unit.
     */
        if (!object || typeof object.amount !== 'number' || object.from == null || object.to == null) {
            throw new Error('convertWeight: object.amount (number), object.from, and object.to are required');
        }
    exports.convertWeight = function (object) {
        var weightinlb;
        var weight;
        if (typeof object.from == 'string') object.from = object.from.toLowerCase();

        switch (object.from) {
            case "lb":
            case "1":
            case 1:
                object.from = 1;
                weightinlb = object.amount;
                break;
            case "oz":
            case "2":
            case 2:
                object.from = 2;
                weightinlb = object.amount * 0.0625;
                break;
            case "kg":
            case "3":
            case 3:
                object.from = 3;
                weightinlb = object.amount * 2.20462;
                break;
            case "g":
            case "4":
            case 4:
                object.from = 4;
                weightinlb = object.amount * 0.00220462;
                break;
        }
        switch (object.to) {
            case "lb":
            case "1":
            case 1:
                object.to = 1;
                weight = weightinlb;
                break;
            case "oz":
            case "2":
            case 2:
                object.to = 2;
                weight = weightinlb / 0.0625;
                break;
            case "kg":
            case "3":
            case 3:
                object.to = 3;
                weight = weightinlb / 2.20462;
                break;
            case "g":
            case "4":
            case 4:
                object.to = 4;
                weight = weightinlb / 0.00220462;
                break;
        }
        if (object.from == object.to) return object.amount;
        return weight;
    };

    return exports;
});
