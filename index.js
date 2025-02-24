require('dotenv').config()
const express = require("express");
const cors = require("cors");
const morgan = require("morgan"); // helps in debugging
const cookieParser = require('cookie-parser');

// const { foo } = require("./middleware/exampleMiddleware");
// const { exampleRouter } = require("./routes/exampleRouter");
const authRouter = require("./routes/authRouter");
const { verifyToken } = require("./middleware/verifyToken");
// const userRouter = require("./routes/userRouter");

const port = 3000;

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT"]
}));
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use(verifyToken);
// app.use(foo);
// app.use(exampleRouter);
app.use('/auth', authRouter);
// app.use(userRouter);

app.get("/", (req, res) => {
    res.status(200).json("hello world from server");
})

app.listen(port, () => {
    console.log(`server is listening at port ${port}`);
})