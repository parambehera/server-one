import express from "express"
import cors from "cors"
import cookieParsr from "cookie-parser"
const app = express();

app.use(
    cors({
        origin:process.env.CORS_ORIGIN,
        methods:"GET, POST, PUT, DELETE, PATCH, HEAD",
        credentials:true
    })
);


app.use(express.urlencoded({extended:true,limit:"20kb"}));
app.use(express.json({limit:"20kb"}))
app.use(cookieParsr())

import userRouter from "./routes/user.routes.js"
app.use("/api/v1/user",userRouter)
export {app}