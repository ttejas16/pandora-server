const express = require("express");
const cors = require("cors");
const morgan = require("morgan"); // helps in debugging

const { foo } = require("./middleware/exampleMiddleware");
const { exampleRouter } = require("./routes/exampleRouter");

const port = 8000;

const app = express();

app.use(cors());
app.use(express.urlencoded({
    extended: true
}))
app.use(morgan("dev"));

app.use(foo);
app.use(exampleRouter);

app.get("/",(req,res) => {
    res.status(200).json("hello world from server");
})

app.listen(port, () => {
    console.log(`server is listening at port ${port}`);
})