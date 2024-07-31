import express from "express";
import * as RC from "./review.controller.js";
import { validation } from '../../middleware/validation.js';
import { auth } from "../../middleware/auth.js";
import * as RV from "./review.validation.js";
import { systemRoles } from "../../utils/systemRoles.js";

const reviewRouter = express.Router({ mergeParams: true });


reviewRouter.post("/",
    validation(RV.createReview),
    auth([systemRoles.admin]),
    RC.createReview);





reviewRouter.delete("/:id",
    validation(RV.deleteReview),
    auth([systemRoles.admin]),
    RC.deleteReview);









export default reviewRouter;
