import express from "express"
import userRouter from "./user";

const mainRouter = express.Router();

mainRouter.use("/users", userRouter)

export default mainRouter