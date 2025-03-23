"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Endpoint = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const EndpointSchema = new mongoose_1.Schema({
    path: {
        type: String,
        required: [true, 'Please add an endpoint path'],
        trim: true
    },
    method: {
        type: String,
        required: [true, 'Please add an HTTP method'],
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        uppercase: true
    },
    schemaDefinition: {
        type: mongoose_1.Schema.Types.Mixed,
        required: [true, 'Please add a schema definition for data generation']
    },
    count: {
        type: Number,
        default: 10,
        min: 1,
        max: 10000
    },
    supportPagination: {
        type: Boolean,
        default: false
    },
    requireAuth: {
        type: Boolean,
        default: false
    },
    apiKeys: {
        type: [String],
        default: []
    },
    delay: {
        type: Number,
        default: 0,
        min: 0,
        max: 5000 // Maximum 5 seconds delay
    },
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    responseType: {
        type: String,
        enum: ['list', 'single'],
        default: 'list'
    },
    parameterPath: {
        type: String,
        default: ':id'
    }
}, {
    timestamps: true
});
// Remove all indexes to start fresh
EndpointSchema.clearIndexes();
const Endpoint = mongoose_1.default.model('Endpoint', EndpointSchema);
exports.Endpoint = Endpoint;
