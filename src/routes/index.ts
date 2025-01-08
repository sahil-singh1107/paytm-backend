import express from "express"
import userRouter from "./user";
import accountRouter from "./account";

const mainRouter = express.Router();

mainRouter.use("/users", userRouter)
mainRouter.use("/account", accountRouter)

export default mainRouter