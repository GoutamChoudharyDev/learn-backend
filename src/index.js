import dotenv from "dotenv"
import connectDB from "./db/connect.db.js";
import app from "./app.js";

// Load environment variables from .env file into process.env
dotenv.config();

// Establish connection with the database
connectDB()
    .then(() => {
        // listen 
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port : ${process.env.PORT}`);
        })
    })
    .catch((error) => {
        console.log("Database connection failed: ", error);
    })