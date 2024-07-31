import express from "express";
import * as UC from "./user.controller.js";
const userRouter = express.Router();


userRouter.post("/signUp", UC.signUp);
userRouter.post("/signIn", UC.signIn);
userRouter.get("/verifyEmail/:token", UC.verifyEmail);
userRouter.get("/refreshToken/:rfToken", UC.refreshToken);
userRouter.patch("/sendCode", UC.forgetPassword);
userRouter.patch("/resetPassword", UC.resetPassword);



export default userRouter;
