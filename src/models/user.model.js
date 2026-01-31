import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// create schema
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    refreshToken: {
        type: String,
    }
}, { timestamps: true });

// Pre-save middleware: runs before saving user document
userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

// custom method to check password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

// Custom method to generate JWT access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },

        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        },
    )
}

// Custom method to generate JWT refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },

        process.env.REFRESH_TOKEN_SECRET,
        console.log("refresh", process.env.REFRESH_TOKEN_SECRET),
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}

// Create and export User model
export const User = mongoose.model("User", userSchema);
