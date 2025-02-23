require ('dotenv').config()
const express = require('express');

const app = express();
const cookieParser = require('cookie-parser');


const { verifyToken } = require('./middleware/verifyToken');
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");

app.use(express.json());
app.use(cookieParser());
// app.use(verifyToken);
app.use('/auth',authRouter);
app.use('/user',userRouter);
app.listen(3000,()=>{
    console.log("Serever is Listening at port 3000")
})