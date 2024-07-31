import { generalFiled } from "../../utils/generalFields.js";
import joi from "joi";


export const createSubCategory = {
    body: joi.object({
        name: joi.string().min(3).max(30).required(),

    }),
    params: joi.object({
        categoryId: generalFiled.id.required(),
    }),
    file: generalFiled.file.required(),
    headers: generalFiled.headers.required()
}

