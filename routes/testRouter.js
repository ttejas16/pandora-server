const express = require('express');
const testRouter = express.Router();
const { getScoresByQuestionId, getSomethingByTestId } = require('../controllers/analytics');




testRouter.get("/qData",(req,res)=>{
    const _ = getScoresByQuestionId("93fb8695-9083-4347-ab1a-311c23358f7e")
    if(_){
        console.log("Inn Sucess")
       res.sendStatus(200)
    }

    //res.json("ERRRRROR")
});
testRouter.get("/getQDataByTestId",getSomethingByTestId)
module.exports = testRouter;