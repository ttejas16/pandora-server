const { prisma } = require("../prisma/prisma");

async function getTestAnalytics(req, res) {
    const testId = req.query.testId;

    if (!req.user.id) {
        res.status(403).json({ success: false, msg: "Unauthorised" });
        return;
    }

    if (!testId) {
        res.status(400).json({ success: false, msg: "expected testId" });
        return;
    }

    const test = await prisma.test.findUnique({ where: { testId: testId } });
    if (test.userId != req.user.id) {
        res.status(403).json({ success: false, msg: "Unauthorised" });
        return;
    }

    const testSubmissions = await prisma.submissions.groupBy({
        by: ["userId"], where: { testId: testId },
    });

    const submissionCount = testSubmissions.length;
    const { maxMarks, userScoreMap } = await getScoresByTestId(testId);

    // console.log("maximum marks: ", maxMarks);
    // console.log("total submissions: ", submissionCount);
    // console.log("userScore map: ", userScoreMap);
    // console.log("avg: ", getTestAvg(userScoreMap));
    


    res.status(200).json({ success: true, data: {} });
}

async function getScoresByTestId(testId) {
    const userScoreMap = {};

    // get a mapping of every questionId to its correct answer
    const correctAnswerMap = {};
    const test = await prisma.test.findUnique({
        where: { testId },
        include: {
            questions: true
        }
    });

    test.questions.forEach(q => {
        correctAnswerMap[q.questionId] = q.answer;
    })

    const submissions = await prisma.submissions.findMany({
        where: { testId: testId }
    });

    submissions.forEach(s => {
        if (!userScoreMap[s.userId]) {
            userScoreMap[s.userId] = 0;
        }
        // console.log("ans - ",s.userAnswer, correctAnswerMap[s.questionId]);

        if (s.userAnswer == correctAnswerMap[s.questionId]) {
            userScoreMap[s.userId] += 1;
        }
    });

    return { userScoreMap: userScoreMap, maxMarks: test.questions.length };
}
//-----------JUST CHANGE THE NAME -------//
async function getSomethingByTestId(req,res){
    
    const testId = req.query.testId;

    if (!req.user.id) {
        res.status(403).json({ success: false, msg: "Unauthorised" });
        return;
    }

    if (!testId) {
        res.status(400).json({ success: false, msg: "expected testId" });
        return;
    }

    const questions = await prisma.questions.findMany({
        where : {
            testId : testId
        },
        select : {
            questionId : true,
            question : true
        }
    });

    if(!questions){
        res.status(304).jsons({success: false, msg: "No Questions Found"})
    }
    console.log("THIS ARE THE QUESTIONS ", questions)
    let data = [];

    for(q in questions){
        console.log("FOR LOOP Q",q)
        const entry = await getScoresByQuestionId(q.questionId);
        console.log("This Are the Entries",entry)
        if(entry){
            data.push(entry);
        }
    }
    console.log("DATA GOT :", data);

    res.status(200).json({success : true, data : data});

}
async function getScoresByQuestionId(questionId){
    let data = {
        qId : null,
        options : [],
        correctAns : null
    }
    let submissions,question ;
  
    
    try {  
        question = await prisma.questions.findFirstOrThrow({
            where : {questionId : questionId},
            select : {
                questionId : true,
                options : true,
                answer : true
            }
        });
    } catch (error) {
        console.log(error);
        return error;
       // res.status(400).json("Internal error //QUESTION NOT FOUND");
    }
    data.qId = question.questionId
    data.correctAns = question.answer

    submissions = await prisma.submissions.findMany ({
        where : { questionId : questionId},
        select :{
            userAnswer : true,
            userId : true,
            User : {
                select : {username :true}
            }
        }
    });
    const options = JSON.parse(question.options);
    const optionsWithUsers = options.map(option => ({
        name: option,
        by: submissions.reduce((users, submission) => {
            if (submission.userAnswer === option) {
                users.push(submission.User.username);
            }
            return users;
        }, [])
    }));    
   // console.log("This is options :;;",options)
   data.options = optionsWithUsers
console.log(data);

    return data
    // res.status(200).json(submissions)


}

function getTestAvg(scoreMap){
    const values = Object.values(scoreMap);
    const avg =  values.reduce((acc, value) => acc + value, 0) / values.length;
    return avg.toFixed(3);
}


module.exports = {
    getTestAnalytics,
    getScoresByQuestionId,
    getSomethingByTestId
}