"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const queryRouter = express_1.default.Router();
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const database = (0, db_1.connectToDatabase)();
    const collection = database.collection("post");
    const allPostsCursor = yield collection.find({});
    const allPosts = yield allPostsCursor.toArray();
    // console.log(allPostsCursor)
    // console.log(allPosts)
    return { allPosts };
});
queryRouter.post("/query", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("hello");
    console.log(req.body);
    const { search } = req.body;
    console.log(search);
    const data = yield run();
    const final = {
        databaseData: data,
        question: search
    };
    if (!search || typeof search !== "string") {
        return res.status(400).send("Invalid or missing query parameter.");
    }
    function initiateFlowRun(value) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const url = "https://api.langflow.astra.datastax.com/lf/ccf6615b-7615-419c-8f3c-d4d14fe37c89/api/v1/run/bf26d86b-78aa-40c6-ad28-b3742d2ad3a4?stream=false";
            const headers = {
                "Content-Type": "application/json",
                Authorization: "Bearer AstraCS:auLJmThoRPnNawNzRfsHOWWH:9caafe92577c70446127fbd4a2bd1156cd4a0a3a09a3c19781f6344fefd86144",
            };
            const body = {
                input_value: value,
                output_type: "chat",
                input_type: "chat",
                tweaks: {
                    "ChatInput-2dFP4": {},
                    "Prompt-sSYWc": {},
                    "ChatOutput-42H9e": {},
                    "GoogleGenerativeAIModel-HzlwC": {},
                },
            };
            try {
                const response = yield fetch(url, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(body),
                });
                if (!response.ok) {
                    console.error(`Langflow API error: ${response.status} - ${response.statusText}`);
                    return null;
                }
                const data = yield response.json();
                const message = (_e = (_d = (_c = (_b = (_a = data.outputs) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.outputs) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.artifacts) === null || _e === void 0 ? void 0 : _e.message;
                if (!message) {
                    console.error("No message returned from Langflow API.");
                    return null;
                }
                return message;
            }
            catch (error) {
                console.error("Error initiating Langflow API flow run:", error);
                return null;
            }
        });
    }
    const finalV2 = JSON.stringify(final);
    try {
        const result = yield initiateFlowRun(finalV2);
        if (!result) {
            return res.status(500).send("Failed to process query through Langflow API.");
        }
        return res.status(200).json({ message: result });
    }
    catch (error) {
        console.error("Error in query route:", error);
        return res.status(500).send("An error occurred while processing the query.");
    }
}));
exports.default = queryRouter;
