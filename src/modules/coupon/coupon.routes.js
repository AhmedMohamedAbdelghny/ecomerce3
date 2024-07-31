import express from "express";
import * as BC from "./coupon.controller.js";
import { validation } from '../../middleware/validation.js';
import { auth } from "../../middleware/auth.js";
import * as BV from "./coupon.validation.js";
import { systemRoles } from "../../utils/systemRoles.js";

const couponRouter = express.Router();


couponRouter.post("/",
    validation(BV.createCoupon),
    auth([systemRoles.admin]),
    BC.createCoupon);



couponRouter.put("/:id",
    validation(BV.updateCoupon),
    auth([systemRoles.admin]),
    BC.updateCoupon);






export default couponRouter;
