"use strict";
exports.__esModule = true;
require("reflect-metadata");
function transient() {
    return function (target, propertyKey) {
        var descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
        descriptor.enumerable = false;
        Object.defineProperty(target, propertyKey, descriptor);
    };
}
exports.transient = transient;
