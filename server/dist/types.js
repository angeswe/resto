"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIEndpoint = isIEndpoint;
// Type guard for IEndpoint
function isIEndpoint(obj) {
    return obj &&
        typeof obj.path === 'string' &&
        typeof obj.method === 'string' &&
        obj.schemaDefinition &&
        typeof obj.count === 'number' &&
        typeof obj.requireAuth === 'boolean' &&
        Array.isArray(obj.apiKeys) &&
        typeof obj.delay === 'number' &&
        typeof obj.projectId === 'string' &&
        (obj.responseType === 'list' || obj.responseType === 'single') &&
        typeof obj.parameterPath === 'string';
}
