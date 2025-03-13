const express = require('express');
const userRouter = express.Router();

const userController = require('../controllers/userController');
const { getTestAnalytics } = require('../controllers/analytics');

userRouter.post('/createTopic', userController.createTopic);
userRouter.get('/getTopics', userController.getTopicsByUserId);
userRouter.post('/joinTopic', userController.joinTopicByCode);
userRouter.get('/getTopicUsers', userController.getUsersByTopicId);
userRouter.post('/createTest', userController.createTest);
userRouter.get('/getTests', userController.getTestsByTopicId);
userRouter.get('/getQuestions', userController.getQuestionsByTestId);
userRouter.post('/submitTest', userController.submitTest);


// analytics route
userRouter.get('/getTestAnalytics', getTestAnalytics);

module.exports = userRouter;