// const jwt = require('jsonwebtoken');
const { prisma } = require('../prisma/prisma');
const { nanoid } = require('nanoid');
const { thumbnailUrls } = require('../utils/thumbnails');

async function getThumbnailUrls(req, res) {
    if (!req.user.id) {
        res.status(400).json({ success: false, msg: "Unauthorised!" });
        return;
    }

    res.json({ success: true, data: { thumbnailUrls: thumbnailUrls } });
}

async function createTopic(req, res) {
    let { title, subTitle, type, thumbnailUrl } = req.body;

    if (type != "public" && type != "private") {
        res.status(400).json({ success: false, msg: "Unknown topic type" });
        return;
    }

    if (!title || !subTitle || !type) {
        res.status(400).json({ success: false, msg: "Empty fields are not allowed" });
        return;
    }

    const user = await prisma.user.findUnique({
        where: {
            userId: req.user.id
        }
    });

    if (!user) {
        res.status(401).json({ success: false, msg: "Unauthorised" });
        return;
    }

    const generatedTopicCode = nanoid(10);

    const topic = await prisma.topic.create({
        data: {
            topicName: title,
            topicSubtitle: subTitle,
            isPublic: type == "public" ? true : false,
            ownerId: req.user.id,
            thumbnailUrl: thumbnailUrl || thumbnailUrls[0],
            topicCode: generatedTopicCode,
        }
    })

    const _ = await prisma.userTopics.create({
        data: {
            userId: req.user.id,
            topicId: topic.topicId,
        }
    })

    res.status(200).json({ success: true, data: { ...topic, isOwner: topic.ownerId == req.user.id } });
}

async function joinTopicByCode(req, res) {
    const topicCode = req.body.topicCode;
    // console.log(req.body);
    if (!req.user.id) {
        res.status(401).json({ success: false, msg: "Unauthorised" });
        return;
    }

    if (!topicCode) {
        res.status(400).json({ success: false, msg: "Empty fields are not allowed!" });
        return;
    }

    const topic = await prisma.topic.findFirst({
        where: { topicCode: topicCode }
    });

    if (!topic) {
        res.status(400).json({ success: false, msg: "Topic does not exist!" });
        return;
    }

    if (topic.ownerId == req.user.id) {
        res.status(400).json({ success: false, msg: "You can't join your own topic!" });
        return;
    }

    const existingJoinEntry = await prisma.userTopics.findFirst({
        where: { userId: req.user.id, topicId: topic.topicId }
    })

    if (existingJoinEntry) {
        res.status(400).json({ success: false, msg: "Topic Already Joined!" });
        return;
    }


    const _ = await prisma.userTopics.create({
        data: {
            userId: req.user.id,
            topicId: topic.topicId,
        }
    })

    res.status(200).json({ success: true, data: { ...topic, isOwner: topic.ownerId == req.user.id } });
}


async function getTopicsByUserId(req, res) {
    if (!req.user.id) {
        res.status(401).json({ success: false, msg: "Unauthorised" });
        return;
    }

    const result = await prisma.user.findUnique({
        where: { userId: req.user.id },
        include: {
            topics: {
                include: { topic: { omit: { topicId: true } } },
                omit: { userId: true, joinedAt: true }
            }
        },
        omit: {
            username: true,
            email: true,
            password: true,
            createdAt: true
        } // only get userId rest info is not needed

    })

    const parsedTopics = result.topics.map(t => {
        return { topicId: t.topicId, ...t.topic, isOwner: t.topic.ownerId == req.user.id };
    })

    // console.log(parsedTopics);


    res.json({ success: true, data: parsedTopics });
}


async function getUsersByTopicId(req, res) {
    if (!req.user.id) {
        res.status(401).json({ success: false, msg: "Unauthorised" });
        return;
    }

    const topicId = req.query.topicId;

    if (!topicId) {
        res.status(400).json({ success: false, msg: "Empty fields are not allowed!" });
        return;
    }

    const result = await prisma.topic.findUnique({
        where: { topicId: topicId },
        include: {
            users: {
                include: { user: { select: { username: true, email: true, userId: true } } }
            }
        }
    });

    const topicUsers = result.users.map(u => u.user);
    const parsedResult = { ...result, users: topicUsers }

    res.status(200).json({ success: true, data: parsedResult });
}

async function createTest(req, res) {
    const topicId = req.body.topicId;
    const title = req.body.title;
    const endDate = req.body.endDate;
    const description = req.body.description;
    const questions = req.body.questions;
    // console.log(questions);


    if (!topicId || !title || !description || !questions) {
        res.status(400).json({ success: false, msg: "Expected topic id and question data!" });
        return;
    }

    const test = await prisma.test.create({
        data: {
            title: title,
            description: description,
            topicId: topicId,
            userId: req.user.id,
            endTime: new Date(endDate)
        }
    });

    questions.forEach(async (q) => {
        await prisma.questions.create({
            data: {
                // testId: test.testId,
                question: q.question,
                options: JSON.stringify(q.options),
                answer: q.correctOption,
                test: { connect: { testId: test.testId } }
            }
        })
    });


    res.status(200).json({ success: true, msg: "Create Test success", data: { testId: test.testId } });
}


async function getTestsByTopicId(req, res) {
    const topicId = req.query.topicId;

    if (!topicId) {
        res.status(400).json({ success: false, msg: "expected a topic id!" });
        return;
    }

    const tests = await prisma.test.findMany({
        where: { topicId: topicId },
        include: {
            _count: { select: { questions: true } },
            // this is to check if user has already submitted the test
            Submissions: {
                where: { userId: req.user.id },
                select: { userId: true },
                distinct: ["userId"]
            }
        }
    })

    res.status(200).json({ success: true, data: { tests } });
}

async function getQuestionsByTestId(req, res) {
    const testId = req.query.testId;
    const userId = req.user.id;

    if (!testId) {
        res.status(400).json({ success: false, msg: " test Id Required" });
        return;
    }

    const test = await prisma.test.findUnique({
        where: { testId: testId }
    });

    if (!test) {
        res.status(400).json({ success: false, msg: " No Test Found " });
        return;
    }

    // start time is not necessary i guess when test is posted we start at that time
    // if (test.startTime > new Date.now()) {
    //     res.status(304).json({ success: false, msg: "Test has Not Yet Started" });
    //     return;
    // }

    // if (test.endTime <= new Date.now()) {
    //     res.status(304).json({ success: false, msg: "Test has Ended" });
    //     return;
    // }

    const questions = await prisma.questions.findMany({
        where: { testId: testId },
        omit: {
            answer: true,
            createdAt: true
        }
    });

    const parsedQuestions = questions.map(q => {
        return {
            ...q,
            options: JSON.parse(q.options)
        }
    })
    // console.log(parsedQuestions);

    res.status(200).json({ success: true, data: { questions: parsedQuestions } });
}

async function searchTopicByTitle(req, res) {
    const searchQuery = req.query.topicName;

    if (!searchQuery) {
        res.status(400).json({ success: false, msg: "Expected a search title!" });
        return;
    }

    const searchResults = await prisma.topic.findMany({
        where: {
            topicName: { contains: searchQuery, mode: "insensitive" },
            isPublic: true
        }
    });

    const parsedTopics = searchResults.map(t => {
        return { ...t, isOwner: t.ownerId == req.user.id };
    })

    res.status(200).json({ success: true, data: { searchResults: parsedTopics } });
}

async function deleteTestById(req, res) {
    const testId = req.query.testId;

    if (!testId) {
        res.status(400).json({ success: false, msg: "Expected a test id!" });
        return;
    }

    try {
        const deletedTest = await prisma.test.delete({
            where: { testId: testId }
        });

        res.status(200).json({ success: true, data: { deletedTestId: deletedTest.testId } });
        return;

    } catch (error) {
        console.log(error);
        res.status(400).json({ success: false, msg: "Something went wrong!" });
        return;
    }
}

async function submitTest(req, res) {
    const testId = req.body.testId;
    const answers = req.body.answers;

    if (!req.user.id) {
        res.status(403).json({ success: false, msg: "Unauthorised" });
        return;
    }

    if (!testId || !answers) {
        res.status(400).json({ success: false, msg: "expected testId and answer data!" });
        return;
    }

    const test = await prisma.test.findUnique({ 
        where: { testId: testId }, 
        include:{
            Submissions: {
                where: { userId: req.user.id },
                select: { userId: true },
                distinct: ["userId"]
            }
        }
    });
    if (test.userId == req.user.id) {
        res.status(400).json({ success: false, msg: "test owners cant take a test!" });
        return;
    }

    if (test.endTime && new Date(Date.now()) > test.endTime) {
        res.status(400).json({ success: false, msg: "Test already ended!" });
        return;
    }

    if (test.Submissions.length) {
        res.status(400).json({ success: false, msg: "Already submitted!" });
        return;
    }

    for (const [questionId, answer] of Object.entries(answers)) {
        await prisma.submissions.create({
            data: {
                testId: testId,
                userId: req.user.id,
                questionId: questionId,
                userAnswer: answer,
                //TEMP CODE ADDING STARTED TIME AS CURRENT TIME
                startedAt: new Date(Date.now())
            }
        })
    }

    res.status(200).json({ success: true, msg: "Submit successfull" });
}

module.exports = {
    getThumbnailUrls,
    createTopic,
    getTopicsByUserId,
    joinTopicByCode,
    getUsersByTopicId,
    createTest,
    getTestsByTopicId,
    getQuestionsByTestId,
    submitTest,
    searchTopicByTitle,
    deleteTestById
};
