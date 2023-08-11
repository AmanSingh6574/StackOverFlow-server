import mongoose from "mongoose";

const loginHistorySchema = mongoose.Schema({
    ipAddress: { type: String, required: true },
    browser: { type: String },
    operatingSystem: { type: String },
    timestamp: { type: Date, default: Date.now },
});

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    about: { type: String },
    tags: { type: [String] },
    joinedOn: { type: Date, default: Date.now },
    limitation : {
        type : Number , 
        default : 1 
    },
    profileImage: { type: String },
    followings: { type: [String], default: [] },
    followers: { type: [String], default: [] },
    planType: { type: String, enum: ["free", "silver", "gold"], default: "free" },
    questionsPostedToday: { type: Number, default: 0 },
    loginHistory: { type: [loginHistorySchema], default: [] }, // New field for login history
});

export default mongoose.model("User", userSchema);
