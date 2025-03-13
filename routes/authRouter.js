const express = require('express');
const authRouter = express.Router();

const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/verifyToken');

// authRouter.use(verifyToken);/
authRouter.post('/login', authController.login);
authRouter.post('/signup', authController.signup);
authRouter.get('/logout', authController.logout);
authRouter.get('/getUser', authController.getUserById);
authRouter.post('/checkEmail', authController.getUserByEmail);
authRouter.post('/checkUserName', authController.getUserByUserName);

module.exports = authRouter;