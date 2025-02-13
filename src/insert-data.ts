import express from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS if needed

const pool = new Pool({
  user: process.env.DB_USER || "",
  host: process.env.DB_HOST || "",
  database: process.env.DB_NAME || "",
  password: process.env.DB_PASSWORD || "",
  port: Number(process.env.DB_PORT) || 5432,
  ssl: { rejectUnauthorized: false },
});

app.get("/", (req, res) => {
  res.send("🚀 Welcome to the IntelliDev API! The server is running.");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connected successfully!",
      timestamp: result.rows[0],
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ error: "Database connection failed!" });
  }
});

// Endpoint to insert data
app.post("/insert-data", async (req, res) => {
  // Check if the request body is an array
  if (!Array.isArray(req.body)) {
    res.status(400).json({ message: "Invalid data format" });
    return;
  }

  // Extract name and email from the array
  const formData = req.body.reduce((acc, item) => {
    if (item.question === "Name") acc.name = item.answer;
    if (item.question === "Email") acc.email = item.answer;
    return acc;
  }, {} as { name?: string; email?: string });

  // Check if name and email are present
  if (!formData.name || !formData.email) {
    res.status(400).json({ message: "Missing name or email" });
    return;
  }

  try {
    // Insert data into the PostgreSQL database
    const query =
      "INSERT INTO userForm (name, email) VALUES ($1, $2) RETURNING *";
    const { rows } = await pool.query(query, [formData.name, formData.email]);

    res
      .status(200)
      .json({ message: "Data inserted successfully", data: rows[0] });
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({ error: "Failed to insert data" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
