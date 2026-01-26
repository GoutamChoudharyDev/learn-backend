import dotenv from "dotenv"
import connectDB from "./db/connect.db.js";

// Load environment variables from .env file into process.env
dotenv.config();

// Establish connection with the database
connectDB();