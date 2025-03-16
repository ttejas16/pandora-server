require('dotenv').config()
const express = require("express");
const cors = require("cors");
const morgan = require("morgan"); // helps in debugging
const cookieParser = require('cookie-parser');

const { verifyToken } = require("./middleware/verifyToken");
const { testDatabase } = require('./prisma/prisma');
const userRouter = require("./routes/userRouter");
const authRouter = require("./routes/authRouter");
const testRouter = require("./routes/testRouter");

const port = 3000;

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use(verifyToken);

app.use('/auth', authRouter);
app.use('/user', userRouter);

app.get("/", (req, res) => {
    res.status(200).json("hello world from server");
})

app.use("/test",testRouter);
app.listen(port, () => {
    console.log(`server is listening at port ${port}`);
    testDatabase();
})