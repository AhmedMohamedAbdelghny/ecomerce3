import { generalFiled } from "../../utils/generalFields.js";
import joi from "joi";


export const createReview = {
    body: joi.object({
        comment: joi.string().required(),
        rate: joi.number().min(1).max(5).integer().required(),
    }),
    params: joi.object({
        productId: generalFiled.id.required(),
    }).required(),
    headers: generalFiled.headers.required()
}


export const deleteReview = {
    params: joi.object({
        id: generalFiled.id.required(),
    }).required(),
    headers: generalFiled.headers.required()
}
