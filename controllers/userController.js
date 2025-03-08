// const jwt = require('jsonwebtoken');
const { prisma } = require('../prisma/prisma');
const { nanoid } = require('nanoid');

const users = {
    "john_doe": { "name": "John Doe", "email": "john@example.com" },
    "jane_doe": { "name": "Jane Doe", "email": "jane@example.com" },
    "alice_smith": { "name": "Alice Smith", "email": "alice@example.com" },
    "bob_jones": { "name": "Bob Jones", "email": "bob@example.com" }
};

// async function profile(req, res) {
//     try {
//         console.log(req.cookies)
//         const token = req.cookies.accessToken;
//         const decoded = jwt.verify(token, process.env.SECRET_KEY);
//         console.log(" this is userController decoded jwt" + decoded)
//         const username = decoded.username;
//         const userDetails = users[username];

//         if (!userDetails) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // const newToken = createToken({ username });
//         // res.cookie('accessToken', newToken, {
//         //     httpOnly: true,
//         //     secure: true,
//         //     sameSite: "none",
//         //     expires: new Date(Date.now() + 65 * 60 * 1000)
//         // });

//         res.json({ userDetails });
//     } catch (error) {
//         console.log(error)
//         res.status(401).json({ message: 'Unauthorized' });
//     }
// }

async function createTopic(req, res) {
    let { title, subTitle, type } = req.body;

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
            thumbnailUrl: "https://www.freepik.com/free-photo/galaxy-nature-aesthetic-background-starry-sky-mountain-remixed-media_17226410.htm#fromView=search&page=1&position=4&uuid=9e700a6d-69fa-439e-9ad0-01adc9fe9b90&query=space",
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
    if(topic.ownerId == req.user.id){
        res.status(400).json({success: false,msg:"You Are Owner of Topic"});
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
            userId: req.user.id
        }
    });

    questions.forEach(async (q) => {
        await prisma.questions.create({
            data: {
                // testId: test.testId,
                question: q.question,
                options: JSON.stringify(q.options),
                answer: q.correctOption,
                test: { connect:{ testId: test.testId } }
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
        where: { topicId: topicId }
    })

    // console.log(tests);
    

    res.status(200).json({ success: true, data: { tests } });

}

async function getQuestionsByTestId(req,res){
    const testId = req.body.testId;
    const userId = req.user.id;

    if(!testId){
        res.status(400).json({ success: false, msg: " test Id Required" });
        return;
    }

    const test = await prisma.test.findUnique({
        where : { testId : testId}
    });

    if(!test){
        res.status(400).json({ success: false, msg: " No Test Found " });
        return;
    }
    if(test.startTime > new Date.now()){
        res.status(304).json({ success: false, msg: "Test has Not Yet Started" });
        return;
    }
    if(test.endTime <= new Date.now()){
        res.status(304).json({ success: false, msg: "Test has Ended" });
        return;
    }

    const questions = await prisma.questions.findMany({
        where : { testId : testId},
        omit: {
           answer : true,
           createdAt : true
        }
    });


    res.setStatus(200).json({sucess : true , questions : questions}) ;

    
    
}

async function submitTest(req,res){
    
}

module.exports = {
    createTopic,
    getTopicsByUserId,
    joinTopicByCode,
    getUsersByTopicId,
    createTest,
    getTestsByTopicId
};
