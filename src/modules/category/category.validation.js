import { generalFiled } from "../../utils/generalFields.js";
import joi from "joi";


export const createCategory = {
    body: joi.object({
        name: joi.string().min(3).max(30).required()
    }),
    file: generalFiled.file.required(),
    headers: generalFiled.headers.required()
}

export const updateCategory = {
    body: joi.object({
        name: joi.string().min(3).max(30)
    }),
    file: generalFiled.file,
    headers: generalFiled.headers.required()
}