import { generalFiled } from "../../utils/generalFields.js";
import joi from "joi";


export const createCart = {
    body: joi.object({
        productId: generalFiled.id.required(),
        quantity: joi.number().integer().required(),

    }),
    headers: generalFiled.headers.required()
}

export const clearCart = {

    headers: generalFiled.headers.required()
}

