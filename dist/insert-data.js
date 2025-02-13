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
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config(); // Load environment variables
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)()); // Enable CORS if needed
const pool = new pg_1.Pool({
    user: process.env.DB_USER || "",
    host: process.env.DB_HOST || "",
    database: process.env.DB_NAME || "",
    password: process.env.DB_PASSWORD || "",
    port: Number(process.env.DB_PORT) || 5432,
    ssl: { rejectUnauthorized: false },
});
// Endpoint to insert data
app.post("/insert-data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the request body is an array
    if (!Array.isArray(req.body)) {
        res.status(400).json({ message: "Invalid data format" });
        return;
    }
    // Extract name and email from the array
    const formData = req.body.reduce((acc, item) => {
        if (item.question === "Name")
            acc.name = item.answer;
        if (item.question === "Email")
            acc.email = item.answer;
        return acc;
    }, {});
    // Check if name and email are present
    if (!formData.name || !formData.email) {
        res.status(400).json({ message: "Missing name or email" });
        return;
    }
    try {
        // Insert data into the PostgreSQL database
        const query = "INSERT INTO userForm (name, email) VALUES ($1, $2) RETURNING *";
        const { rows } = yield pool.query(query, [formData.name, formData.email]);
        res
            .status(200)
            .json({ message: "Data inserted successfully", data: rows[0] });
    }
    catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).json({ error: "Failed to insert data" });
    }
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
