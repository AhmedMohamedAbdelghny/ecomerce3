import mongoose, { Types } from "mongoose";


const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
        minLength: 3,
        maxLength: 30,
        trim: true,
        lowercase: true,
        unique: true
    },
    slug: {
        type: String,
        minLength: 3,
        maxLength: 30,
        trim: true,
        unique: true
    },
    createdBy: {
        type: Types.ObjectId,
        ref: "user",
        required: true
    },
    image: {
        secure_url: String,
        public_id: String
    },
    customId: String


}, {
    timestamps: true,
    versionKey: false,
})


const brandModel = mongoose.model("brand", brandSchema)

export default brandModel;
