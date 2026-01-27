import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

// Buil express app...
const app = express();

// Enable CORS to allow requests from frontend
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

// Middlewares...
// Parse incoming JSON payloads (with size limit)
app.use(express.json({ limit: "20kb" }));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

// Serve static files from "public" folder
app.use(express.static("public"));

// Parse cookies from incoming requests
app.use(cookieParser());

// routes Import...
import userRouter from "./routes/user.routes.js"

// routes declare
app.use("/api/v1/users", userRouter)

// export app
export default app;