import mongoose, { Schema } from "mongoose";

// create subscriptionSchema
const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "User",
        },
        chanel: {
            type: Schema.Types.ObjectId, // one to whome subscriber is subscribing
            ref: "User",
        },
    },
    {
        timestamps: true
    }
)

// create and export subscription model
export const Subscription = mongoose.model("Subscription", subscriptionSchema);