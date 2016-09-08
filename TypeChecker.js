'use strict';

function TypeChecker() {

    function isUndef(someVariable) {
        return typeof someVariable === "undefined";
    }

    // to avoid 0 cases
    function isEmpty(val) {
        return isUndef(val) || val === null || val === "";
    }

    function isNotEmpty(val) {
        return !isEmpty(val);
    }

    function isString(x) {
        return typeof x === "string" || x instanceof String;
    }

    function isArray(x) {
        if (x) {
            return x.constructor === Array;
        }

        return false; // ja null etc
    }

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function isObject(x) {
        return typeof x === "object" && x !== null && isArray(x) === false;
    }

    // http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
    function isFunction(functionToCheck) {
        let getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    function isDate(d) {
        if (Object.prototype.toString.call(d) === "[object Date]") {
            // it is a date
            if (isNaN(d.getTime())) {  // d.valueOf() could also work
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    }


    return {
        isUndef: isUndef,
        isEmpty: isEmpty,
        isString: isString,
        isArray: isArray,
        isNumeric: isNumeric,
        isObject: isObject,
        isNotEmpty: isNotEmpty,
        isFunction: isFunction,
        isDate: isDate
    };
}

module.exports = TypeChecker;
