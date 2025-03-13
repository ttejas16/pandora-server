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

function getTestAvg(scoreMap){
    const values = Object.values(scoreMap);
    const avg =  values.reduce((acc, value) => acc + value, 0) / values.length;
    return avg.toFixed(3);
}

module.exports = {
    getTestAnalytics
}