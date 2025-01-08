require('dotenv').config()
import express from "express"
const Database = require("./utils/db");
const username = process.env.MONGO_USERNAME
const password = process.env.MONGO_PASS
const dbname = process.env.MONGO_DBNAME
const app = express();

Database.connect(username,password,dbname);

app.listen(3000, () => {
    console.log("server is listening on port 3000")
})