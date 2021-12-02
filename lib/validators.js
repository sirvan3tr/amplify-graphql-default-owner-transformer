"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeValidators = void 0;
const libphonenumber_js_1 = require("libphonenumber-js");
const net = __importStar(require("net"));
const TIME_REGEX = /^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])(\.\d{1,})?(([Z])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/;
const RFC_3339_REGEX_DATE = /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01]))$/;
const RFC_3339_REGEX_DATE_TIME = /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60))(\.\d{1,})?(([Z])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/;
const EMAIL_ADDRESS_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const BOOL_REGEX = /^(true|false)$/i;
const validateString = (x) => x === x.toString();
const validateInt = (x) => !Number.isNaN(parseInt(x, 10));
const validateFloat = (x) => !Number.isNaN(parseFloat(x));
const validateAwsDate = (x) => validateDate(x);
const validateAwsTime = (x) => validateTime(x);
const validateAwsDateTime = (x) => validateDateTime(x);
const validateAwsTimestamp = (x) => !Number.isNaN(parseInt(x, 10));
const validateAwsPhone = (x) => (0, libphonenumber_js_1.isValidNumber)(x);
const validateTime = (time) => {
    return TIME_REGEX.test(time);
};
const leapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};
const validateDate = (date) => {
    if (!RFC_3339_REGEX_DATE.test(date)) {
        return false;
    }
    const year = Number(date.slice(0, 4));
    const month = Number(date.slice(5, 2));
    const day = Number(date.slice(8, 2));
    switch (month) {
        case 2:
            if (leapYear(year) && day > 29) {
                return false;
            }
            else if (!leapYear(year) && day > 28) {
                return false;
            }
            return true;
        case 4:
        case 6:
        case 9:
        case 11:
            if (day > 30) {
                return false;
            }
            break;
    }
    return true;
};
const validateDateTime = (dateTime) => {
    if (!RFC_3339_REGEX_DATE_TIME.test(dateTime)) {
        return false;
    }
    const t = Date.parse(dateTime);
    if (Number.isNaN(t)) {
        return false;
    }
    const index = dateTime.indexOf('T');
    const date = dateTime.slice(0, index);
    const time = dateTime.slice(index + 1);
    return validateDate(date) && validateTime(time);
};
const validateBoolean = (x) => {
    return BOOL_REGEX.test(x);
};
const validateJson = (x) => {
    try {
        JSON.parse(x);
        return true;
    }
    catch (e) {
        return false;
    }
};
const validateAwsEmail = (x) => {
    return EMAIL_ADDRESS_REGEX.test(x);
};
const validateAwsUrl = (x) => {
    try {
        new URL(x);
        return true;
    }
    catch (e) {
        return false;
    }
};
const validateAwsIpAddress = (x) => {
    return net.isIP(x) !== 0;
};
class TypeValidators {
    constructor() {
        this.ID = validateString;
        this.String = validateString;
        this.Int = validateInt;
        this.Float = validateFloat;
        this.Boolean = validateBoolean;
        this.AWSJSON = validateJson;
        this.AWSDate = validateAwsDate;
        this.AWSTime = validateAwsTime;
        this.AWSDateTime = validateAwsDateTime;
        this.AWSTimestamp = validateAwsTimestamp;
        this.AWSEmail = validateAwsEmail;
        this.AWSURL = validateAwsUrl;
        this.AWSPhone = validateAwsPhone;
        this.AWSIPAddress = validateAwsIpAddress;
    }
}
exports.TypeValidators = TypeValidators;
//# sourceMappingURL=validators.js.map