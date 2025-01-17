import express from "express";
import { z } from "zod"
import { DBInstance } from "../utils/db";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { authMiddleware, IGetUserAuthInfoRequest } from "../middleware/middleware";

const userRouter = express.Router();

const User = z.object({
    firstName : z.string().min(3).max(50),
    lastName : z.string().min(3).max(50),
    email : z.string(),
    password : z.string().min(8)
})

userRouter.post("/signup", async function (req, res) {

    if (!User.safeParse(req.body).success) {
        res.send("Wrong details");
        return;
    }

    const { firstName, lastName, email, password } = req.body;

    try {
        const dbInstance = await DBInstance.getInstance();

        if (await dbInstance.checkUserAlreadyExists(email)) {
            res.status(411).json({message : "User already exists"});
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userId = await dbInstance.createUser(firstName, lastName, email, hashedPassword);
        await dbInstance.createAccount(userId!.toString());

        const token = jwt.sign({userId}, "sdaf");

        res.status(200).json({message : "User created successfully", token});
        return;

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})

userRouter.post("/signin", async function (req, res) {

    const {email, password} = req.body

    try {
        const dbInstance = await DBInstance.getInstance();

        if (!await dbInstance.checkUserAlreadyExists(email)) {
            res.status(411).json({message : "User doesn't exists"});
            return;
        }

        const user = await dbInstance.getUser(email);

        const result = await bcrypt.compare(password, user!.password);

        if (result) {
            const token = jwt.sign({userId : user?._id}, "sdaf");
            res.status(200).json({message : "Signed in successfully", token});
            return;
        }

        else {
            res.status(411).json({message : "Either email or password is wrong"});
            return;
        }

    } catch (error) {
        console.log(error);
    }
})

userRouter.put("/updateinfo", authMiddleware, async function(req : IGetUserAuthInfoRequest, res) {
    const {password, firstName, lastName} = req.body;
    try {
        const dbInstance = await DBInstance.getInstance();
        await dbInstance.updateUser(req.userId!, password, firstName, lastName);
        res.status(200).json({message : "Updated sucessfully"});
        return;
    } catch (error) {
        console.log(error);
        res.status(411).json({message : "Error updating user"});
    }
})

userRouter.get("/bulk", authMiddleware, async function (req, res) {
    try {
        const name = req.query.filter as string
        const dbInstance = await DBInstance.getInstance();
        const users = await dbInstance.getAllUsers(name);
        res.status(200).json({users, message : ""})
    } catch (error) {
        console.log(error);
        res.status(411).json({message : "Error getting user"});
    }
})

export default userRouter