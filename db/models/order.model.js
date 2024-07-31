import mongoose, { Types } from "mongoose";


const orderSchema = new mongoose.Schema({

    user: {
        type: Types.ObjectId,
        ref: "user",
        required: true
    },
    products: [{
        title: { type: String, required: true },
        productId: { type: Types.ObjectId, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        finalPrice: { type: Number, required: true },
    }],
    subPrice: { type: Number, required: true },
    couponId: { type: Types.ObjectId, ref: "coupon" },
    totalPrice: { type: Number, required: true },

    paymentMethod: {
        type: String,
        required: true,
        enum: ["cash", "card"]
    },
    status: {
        type: String,
        enum: ["placed", "waitPayment", "onWay", "delivered", "cancelled", "rejected"],
        default: "placed"
    },
    address: { type: String, required: true },
    phone: { type: String, required: true },

    cancelledBy: {
        type: Types.ObjectId,
        ref: "user",
    },
    reason: String

}, {
    timestamps: true,
    versionKey: false,
})


const orderModel = mongoose.model("order", orderSchema)

export default orderModel;
