import mongoose from "mongoose";
import { systemRoles } from "../../src/utils/systemRoles.js";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
        minLength: 3,
        maxLength: 15,
        trim: true
    },
    email: {
        type: String,
        required: [true, "name is required"],
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "password is required"],
        trim: true
    },
    age: {
        type: Number,
        required: [true, "age is required"],
    },
    phone: [String],
    address: [String],
    confirmed: {
        type: Boolean,
        default: false
    },
    loggedIn: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: Object.values(systemRoles),
        default: systemRoles.user
    },
    passwordChangedAt: Date,
    code: String,



}, {
    timestamps: true,
    versionKey: false,
})


const userModel = mongoose.model("user", userSchema)

export default userModel;
