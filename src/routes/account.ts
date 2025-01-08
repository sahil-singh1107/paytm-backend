import express from "express"
import { authMiddleware, IGetUserAuthInfoRequest } from "../middleware/middleware";
import { DBInstance } from "../utils/db";
const accountRouter = express.Router();

accountRouter.get("/balance", authMiddleware, async function (req : IGetUserAuthInfoRequest, res) {
    try {
       const dbInstance = await DBInstance.getInstance();
       const balance = await dbInstance.getBalance(req.userId!);
       res.status(200).json({balance});
    } catch (error) {
        console.log(error);
        res.status(500).json({message : "Internal Server Error"});
        return;
    }
})

export default accountRouter