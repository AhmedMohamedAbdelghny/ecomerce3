import express from "express";
import * as SCC from "./subCategory.controller.js";
import { multerHost, validExtensions } from '../../middleware/multer.js';
import { validation } from '../../middleware/validation.js';
import { auth } from "../../middleware/auth.js";
import * as SCV from "./subCategory.validation.js";
import { systemRoles } from "../../utils/systemRoles.js";

const subCategoryRouter = express.Router({ mergeParams: true });


subCategoryRouter.post("/",
    multerHost(validExtensions.image).single("image"),
    validation(SCV.createSubCategory),
    auth([systemRoles.admin]),
    SCC.createSubCategory);



subCategoryRouter.get("/",
    // auth(Object.values(systemRoles)),
    SCC.getSubCategories);








export default subCategoryRouter;
