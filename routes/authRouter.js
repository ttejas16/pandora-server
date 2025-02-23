const express = require('express');


const authRouter = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/verifyToken');

// authRouter.use(verifyToken);/
authRouter.post('/login',authController.login);


module.exports = authRouter;