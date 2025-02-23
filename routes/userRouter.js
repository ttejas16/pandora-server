const express = require('express');


const userRouter = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/verifyToken');

// authRouter.use(verifyToken);/
userRouter.get('/dashboard',verifyToken,userController.profile);


module.exports = userRouter;