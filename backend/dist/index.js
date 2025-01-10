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
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const upload_1 = __importDefault(require("./routes/upload"));
const query_1 = __importDefault(require("./routes/query"));
const loadToAi_1 = __importDefault(require("./routes/loadToAi"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/v1/upload", upload_1.default);
app.use("/api/v1/search", query_1.default);
app.use("/api/v1/load", loadToAi_1.default);
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.connectToDatabase)();
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT} at http://localhost:3000`);
    });
});
main();
exports.default = app;
