import mongoose, { Types } from "mongoose";


const wishListSchema = new mongoose.Schema({

    user: {
        type: Types.ObjectId,
        ref: "user",
        required: true
    },
    products: [{
        type: Types.ObjectId,
        ref: "product",
        required: true
    }],


}, {
    timestamps: true,
    versionKey: false,
})


const wishListModel = mongoose.model("wishList", wishListSchema)

export default wishListModel;
