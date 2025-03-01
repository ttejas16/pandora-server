const express = require('express');
const userRouter = express.Router();

const userController = require('../controllers/userController');

userRouter.post('/createTopic', userController.createTopic);
userRouter.get('/getTopics', userController.getTopicsByUserId);
userRouter.post('/joinTopic', userController.joinTopicByCode);
userRouter.get('/getTopicUsers', userController.getUsersByTopicId);

module.exports = userRouter;