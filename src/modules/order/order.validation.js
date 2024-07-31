import { generalFiled } from "../../utils/generalFields.js";
import joi from "joi";


export const createOrder = {
    body: joi.object({
        productId: generalFiled.id,
        quantity: joi.number().integer(),
        phone: joi.string().required(),
        address: joi.string().required(),
        paymentMethod: joi.string().valid("cash", "card").required(),
        couponCode: joi.string().min(3),
    }),
    headers: generalFiled.headers.required()
}




export const cancelOrder = {
    body: joi.object({
        reason: joi.string().min(3),
    }),
    params: joi.object({
        id: generalFiled.id.required()
    }).required(),
    headers: generalFiled.headers.required()
}



