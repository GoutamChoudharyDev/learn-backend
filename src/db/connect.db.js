import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Function to connect the application with MongoDB
const connectDB = async () => {
    try {
        // Connect to MongoDB using URI from environment variables
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );

        // Log database host after successful connection
        console.log(
            `Database connected !! DB HOST : ${connectionInstance.connection.host}`
        );
    } catch (error) {
        // Handle database connection errors
        console.log("DB ERROR: ", error);

        // Exit process if DB connection fails
        process.exit(1);
    }
}

export default connectDB;