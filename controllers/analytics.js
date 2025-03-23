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
    // maxMarks is a number and
    // userScoreMap is an object of structure { [userId]:{ userName:string, score:number } }

    const testAvg = getTestAvg(userScoreMap);
    const markDistribution = getMarksDistribution(maxMarks, userScoreMap);

    // console.log(submissionCount,
    //     maxMarks,
    //     testAvg,
    //     markDistribution,
    //     userScoreMap);

    res.status(200).json({
        success: true,
        data: {
            submissionCount,
            maxMarks,
            testAvg,
            markDistribution,
            userScoreMap
        }
    });
}

async function getScoresByTestId(testId) {
    // structure of userScoreMap { [userId]:{ userName:"", email:"", score:0 } }
    const userScoreMap = {};

    // get a mapping of every questionId to its correct answer
    const correctAnswerMap = {};
    const test = await prisma.test.findUnique({
        where: { testId },
        include: {
            questions: true,
        }
    });

    test.questions.forEach(q => {
        correctAnswerMap[q.questionId] = q.answer;
    })

    const submissions = await prisma.submissions.findMany({
        where: { testId: testId }, include: { User: true }
    });

    submissions.forEach(s => {
        if (!userScoreMap[s.userId]) {
            userScoreMap[s.userId] = { userName: s.User.username, email: s.User.email, score: 0 }
        }
        // console.log("ans - ",s.userAnswer, correctAnswerMap[s.questionId]);

        if (s.userAnswer == correctAnswerMap[s.questionId]) {
            userScoreMap[s.userId].score += 1;
        }
    });

    const sortedUserScoreMapDesc = {};
    const entries = [];

    for (const userId in userScoreMap) {
        entries.push([userId, userScoreMap[userId]]);
    }

    // sort by descending order of scores
    entries.sort(([, a], [, b]) => b.score - a.score);
    entries.forEach(([k, v]) => {
        sortedUserScoreMapDesc[k] = v;
    })

    return {
        userScoreMap: sortedUserScoreMapDesc,
        maxMarks: test.questions.length
    };
}

async function getQuestionAnalytics(req, res) {

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
        where: {
            testId: testId
        },
        select: {
            questionId: true,
            question: true
        }
    });

    if (!questions.length) {
        res.status(304).json({ success: false, msg: "No Questions Found" });
        return;
    }

    let data = [];

    for (const q of questions) {
        const entry = await getScoresByQuestionId(q.questionId);

        if (entry) {
            data.push(entry);
        }
    }
    // console.log(JSON.stringify(data, null, 1));

    res.status(200).json({ success: true, data: { questionData: data } });

}

async function getScoresByQuestionId(questionId) {
    // each question entry structure
    let data = {
        question: null,
        qId: null,
        options: [],
        correctAns: null
    }

    let submissions, question;

    try {
        question = await prisma.questions.findFirstOrThrow({
            where: { questionId: questionId },
            select: {
                question: true,
                questionId: true,
                options: true,
                answer: true
            }
        });
    } catch (error) {
        console.log(error);
        return error;
        // res.status(400).json("Internal error //QUESTION NOT FOUND");
    }

    data.question = question.question;
    data.qId = question.questionId
    data.correctAns = question.answer

    submissions = await prisma.submissions.findMany({
        where: { questionId: questionId },
        select: {
            userAnswer: true,
            userId: true,
            User: {
                select: { username: true }
            }
        }
    });

    const options = JSON.parse(question.options);
    const optionsWithUsers = options.map(option => {

        // each option is of structure { name:"", by:[usernames... ] }
        return {
            name: option,
            by: submissions.reduce((acc, submission) => {
                if (submission.userAnswer == option) {
                    return [...acc, submission.User.username]
                }
                return acc
            }, [])
        }

    });

    data.options = optionsWithUsers
    return data;
}

function getTestAvg(scoreMap) {
    const values = Object.values(scoreMap);
    if (values.length == 0) {
        return 0.000;
    }

    const avg = values.reduce((acc, obj) => acc + obj.score, 0) / values.length;
    return avg.toFixed(3);
}

function getMarksDistribution(maxMarks, userScoreMap) {
    // get a map of each mark 0,1,2,... to number of users with those marks
    const distribution = {};
    Object.values(userScoreMap).sort((a, b) => a.score - b.score).forEach(obj => {
        if (!distribution[obj.score]) {
            distribution[obj.score] = 0;
        }

        distribution[obj.score] += 1;
    });

    // parse this map to fit data structure required for chart.js i.e array of objects [{ x:number, y:number }]
    let result = [];
    for (const key in distribution) {
        result.push({ x: parseInt(key), y: distribution[key] })
    }

    return result;
}

module.exports = {
    getTestAnalytics,
    getScoresByQuestionId,
    getQuestionAnalytics
}