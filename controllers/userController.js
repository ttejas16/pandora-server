const express = require('express');
const jwt =  require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const Pool = require('../dbConfig');
import { PrismaClient } from '@prisma/client';
import { decode } from 'punycode';

const prisma = new PrismaClient();
const users = {
    "john_doe": { "name": "John Doe", "email": "john@example.com" },
    "jane_doe": { "name": "Jane Doe", "email": "jane@example.com" },
    "alice_smith": { "name": "Alice Smith", "email": "alice@example.com" },
    "bob_jones": { "name": "Bob Jones", "email": "bob@example.com" }
};

function createToken(payload) {
    const token = jwt.sign({ payload }, process.env.SECRET_KEY, { expiresIn: '10mins' });
    return token;
}

async function profile(req,res){
    try {
        console.log(req.cookies)
        const token = req.cookies.accessToken;
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        console.log(" this is userController decoded jwt"+ decoded)
        const username = decoded.username ;
        const userDetails = users[username];

        if (!userDetails) {
            return res.status(404).json({ message: 'User not found' });
        }

        // const newToken = createToken({ username });
        // res.cookie('accessToken', newToken, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: "none",
        //     expires: new Date(Date.now() + 65 * 60 * 1000)
        // });

        res.json({ userDetails });
    } catch (error) {
        console.log(error)
        res.status(401).json({ message: 'Unauthorized' });
    }
}

async function createTopic(req,res){

    let{title,description,type} = req.body;
    token = req.cookies.accessToken;
    const decoded = jwt.verify(token,process.env.SECRET_KEY);
    const userId = decoded.id;

    if(!title || !description || !type ){
        res.status(400).json({ success: false, msg: "Empty credentials are not allowed" });
        return;
    }
    const user = await prisma.user.findUnique({
        where:{
            userId : id
        }
    });

    if(user == null){
        res.status(401).json({ success: false, msg: "Unauthorised" });
        return;
    }
    const topic = await prisma.topics.findUnique({
        where :{
           topicName: title,
           userId : id
        }
    });

    if(topic != null){
        res.status(400).json({ success: false, msg: `You Have Already Existing Topic:  ${title} `});
        return;
    }
    let isPublic = false;
    ///NOT SURE CODE
        if(type == "public")
        {
            isPublic = true;
        }
    const topicCode = generateCode()
    try{

        const _ = await prisma.topics.create({
            data:{
                userId : id,
                topicName : title,
                description : description,
                isPublic : isPublic,
                topicCode : topicCode,
                createdAt : new Date()

            },
          });
    } catch(err){
    
        console.log(err);
        res.status(500).json({ success: false, msg: "Internal server error" });
        return;
    }

    res.status(200).json({ success: true, msg: topicCode});



    
}
async function dbCheck(req,res) {
    
    
}
module.exports = {profile};
