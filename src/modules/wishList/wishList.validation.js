import { generalFiled } from "../../utils/generalFields.js";
import joi from "joi";


export const createWishList = {
    params: joi.object({
        productId: generalFiled.id.required(),
    }).required(),
    headers: generalFiled.headers.required()
}
