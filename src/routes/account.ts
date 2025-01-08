import express from "express"
import { authMiddleware, IGetUserAuthInfoRequest } from "../middleware/middleware";
import { DBInstance } from "../utils/db";
const accountRouter = express.Router();

accountRouter.get("/balance", authMiddleware, async function (req : IGetUserAuthInfoRequest, res) {
    try {
       const dbInstance = await DBInstance.getInstance();
       const account = await dbInstance.getAccount(req.userId!);
       res.status(200).json({balace :  account!.balance});
    } catch (error) {
        console.log(error);
        res.status(500).json({message : "Internal Server Error"});
        return;
    }
})

accountRouter.post("/transfer", authMiddleware, async function (req : IGetUserAuthInfoRequest, res) {
    const {to, amount} = req.body
    try {
        const dbInstance = await DBInstance.getInstance();
        const response = await dbInstance.transferMoney(req.userId!, to, amount);
        if (response?.success) {
            res.status(200).json({message : response.message});
            return;
        }
        else {
            res.status(411).json({message : response?.message});
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message : "Internal Server Error"});
        return;
    }
})

export default accountRouter