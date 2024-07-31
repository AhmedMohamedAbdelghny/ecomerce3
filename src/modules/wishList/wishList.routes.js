import express from "express";
import * as CC from "./wishList.controller.js";
import { validation } from '../../middleware/validation.js';
import { auth } from "../../middleware/auth.js";
import * as CV from "./wishList.validation.js";
import { systemRoles } from "../../utils/systemRoles.js";

const wishListRouter = express.Router({ mergeParams: true });


wishListRouter.post("/",
    validation(CV.createWishList),
    auth(Object.values(systemRoles)),
    CC.createWishList);











export default wishListRouter;
