import mongoose, { Schema } from "mongoose";

// create subscriptionSchema
const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: String,
            required: true,
            unique: true,
        },
        chanel: {
            type: String,
            required: true,
            unique: true
        },
    },
    {
        timestamps: true
    }
)

// create and export subscription model
export const Subscription = mongoose.model("Subscription", subscriptionSchema);