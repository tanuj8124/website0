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
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const db_1 = require("../db");
const path_1 = __importDefault(require("path"));
const uploadRouter = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: "uploads/" }); // Configure Multer to save files to 'uploads/' directory
function getOrCreateCollection(database, collectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield database.collection(collectionName);
            console.log(`Using existing collection ${collection.keyspace}.${collection.collectionName}`);
            return collection;
        }
        catch (error) {
            if (error.message.includes("not found")) {
                console.log(`Collection ${collectionName} does not exist. Creating it...`);
                const newCollection = yield database.createCollection(collectionName, {
                    vector: {
                        service: {
                            provider: "nvidia",
                            modelName: "NV-Embed-QA",
                        },
                    },
                });
                console.log(`Created collection ${newCollection.keyspace}.${newCollection.collectionName}`);
                return newCollection;
            }
            else {
                throw new Error(`Error retrieving or creating collection: ${error.message}`);
            }
        }
    });
}
function processCsvFile(collection, filePath, embeddingStringCreator) {
    return __awaiter(this, void 0, void 0, function* () {
        const documents = [];
        yield new Promise((resolve, reject) => {
            fs_1.default.createReadStream(filePath)
                .pipe((0, csv_parser_1.default)())
                .on("data", (data) => {
                documents.push(Object.assign(Object.assign({}, data), { $vectorize: embeddingStringCreator(data) }));
            })
                .on("end", resolve)
                .on("error", reject);
        });
        const inserted = yield collection.insertMany(documents);
        console.log(`Inserted ${inserted.insertedCount} items.`);
    });
}
uploadRouter.post("/file", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).send("No file uploaded.");
        return;
    }
    const filePath = path_1.default.resolve(req.file.path);
    try {
        const database = (0, db_1.connectToDatabase)();
        const collection = yield getOrCreateCollection(database, "post");
        yield processCsvFile(collection, filePath, (data) => "done");
        res.status(200).send("File processed successfully.");
    }
    catch (error) {
        console.error(error);
        res.status(500).send(`Error processing file: ${error.message}`);
    }
}));
exports.default = uploadRouter;
