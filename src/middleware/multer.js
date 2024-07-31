import multer from "multer";
import { nanoid, customAlphabet } from 'nanoid'
import { AppError } from "../utils/classError.js";
import path from "path"
import fs from "fs"


export const validExtensions = {
    image: ["image/png", "image/jpeg"],
    video: ["video/mp4"],
    pdf: ["application/pdf"],
}


export const multerLocal = (customValidation = [], customPath = "Generals") => {


    const allPath = path.resolve(`uploads/${customPath}`)
    if (!fs.existsSync(allPath)) {
        fs.mkdirSync(allPath, { recursive: true })
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, allPath)

        },
        filename: function (req, file, cb) {
            console.log(file);

            cb(null, nanoid(5) + file.originalname)
        }
    })


    const fileFilter = (req, file, cb) => {
        if (!customValidation.includes(file.mimetype)) {
            return cb(new AppError("invalid file type"))
        }
        cb(null, true)

    }

    const upload = multer({ storage, fileFilter })
    return upload
}


export const multerHost = (customValidation = []) => {
    const storage = multer.diskStorage({})
    const fileFilter = (req, file, cb) => {
        if (!customValidation.includes(file.mimetype)) {
            return cb(new AppError("invalid file type"))
        }
        cb(null, true)

    }

    const upload = multer({ storage, fileFilter })
    return upload
}