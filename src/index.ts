require('dotenv').config()
import express from "express"
import cors from "cors"
const app = express();
import { DBInstance } from "./utils/db";
import { userSchema } from "./schemas";
import mainRouter from "./routes/index";

app.use(cors())
app.use(express.json());

app.use("/api/v1", mainRouter);

(async () => {
    try {
        const dbInstance = await DBInstance.getInstance();
        await dbInstance.createCollection("users", userSchema);
    } catch (error) {
        console.error(error);
    }
})();


app.listen(3000, () => {
    console.log("server is listening on port 3000")
})