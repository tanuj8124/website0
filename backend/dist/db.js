"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
const astra_db_ts_1 = require("@datastax/astra-db-ts");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let dbInstance;
function connectToDatabase() {
    if (dbInstance) {
        return dbInstance;
    }
    const { ASTRA_DB_API_ENDPOINT: endpoint, ASTRA_DB_APPLICATION_TOKEN: token } = process.env;
    if (!token || !endpoint) {
        throw new Error("Environment variables ASTRA_DB_API_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN must be defined.");
    }
    const client = new astra_db_ts_1.DataAPIClient(token);
    dbInstance = client.db(endpoint);
    console.log(`Connected to database ${dbInstance.id}`);
    return dbInstance;
}
