const express = require("express");
const { test } = require("../controllers/example");

const exampleRouter = express.Router();

exampleRouter.get("/example", test);

module.exports = { exampleRouter };