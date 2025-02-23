const express = require('express');
const bcrypt = require('bcrypt');
const jwt =  require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
function createToken(payload){

    const token  =  jwt.sign({...payload},process.env.SECRET_KEY,{expiresIn : '10mins'});
    return token;

}



async function login(req,res){
    const username = req.body.username;
    
    const password =  req.body.password;
    
   /*   INTIAL CODE FOR TESTING AUTH
    console.log(username,password)
    if(username != password){
        res.status(400).json({ success: false, msg: "Invalid credentials" });
        return;
    }
      */
    
    if (!username || !password) {
      res.status(400).json({ success: false, msg: "Empty credentials are not allowed" });
      return;
  }
  
  const user = await prisma.user.findUnique({
    where: {
      OR:[
        {
          email : username
        },{
          username : username
        }
      ]
    }
  });
  
  if(!user){
    res.status(400).json({ success: false, msg: "Invalid credentials" });
    return;
  }
  try {
    // compare hash against plain text password
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      res.status(400).json({ success: false, msg: "Invalid credentials" });
      return;
    }
    
    const token = createToken({username :user.username,id : user.userId });
    console.log("THis is login route token"+token)
    res.cookie('accessToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + 65 * 60 * 1000)
    });
    res.status(200).json({ success: true, msg: "Valid credentials" });
  } catch(err){
    console.log(err)
    res.status(500).json({ success: false, msg: "Internal server error" });
    return;
  }

  delete user.password;
  delete password;
  res.status(200).json({ success: true, msg: "Login successfull", user: user });
} 


async function signup(req,res){
    let{username,email,password1,password2} = req.body;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

   // let hashedPassword = await bcrypt.hash(password,process.env.SALT);

    if(!username || !email || !password1 || !password2){
      res.status(400).json({ success: false, msg: "Empty credentials are not allowed" });
      return;
    }

    if(password1 != password2){
      res.status(400).json({ success: false, msg: "Passwords Doesn't Match" });
        return;
    }
    if(!regex.test(password1)){
      res.status(400).json({ success: false, msg: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character." });
        return;
    }

    const result = await prisma.user.findUnique({
      where :{
        OR:[
          {
            email : email
          },
          {
            username :username
          }
        ]
      }
    });

  if(result != null){
    if(result.username == username){
      res.status(200).json({ success: false, msg: "The username is not avaliable" });
        return;
    }
    else if(result.email == email){
      res.status(200).json({ success: false, msg: "The email address is already registered" });
        return;
    }
  }

  try{
    const hash = await bcrypt.hash(password1,10);

    const _ = await prisma.user.create({
      data:{

        username : username,
        password : hash,
        email : email,
        createdAt : new Date()
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: "Internal server error" });
    return;
    }

    res.status(200).json({ success: true, msg: "User registered" });

    

}


module.exports = {login,signup};