const bcrypt = require('bcrypt')
const express = require('express')
const jwt = require('jsonwebtoken')
const PORT = process.env.PORT || 3000
require('dotenv').config()


const app = express();
app.use(express.json())
app.post("/login",(req,res)=>{
    
    //Check If use is Autherized using password ......


    const username = req.body.username
    const user = { name : username}
    const accessToken =  jwt.sign(user,process.env.SECRET_KEY,{expiresIn : '15s' })
    const refreshToken =  jwt.sign(user,process.env.RFRESH_SERCET_KEY)
    console.log(accessToken)
    res.json({accessToken : accessToken ,refreshToken : refreshToken
    })
});

app.get("/",authenticateToken,(req,res) =>{
    res.json({user : req.user.username})
})

function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization']
    console.log(authHeader)
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null ) {
        console.log("Null AUTH")
        return res.sendStatus(401)
    }
    console.log(authHeader)

    jwt.verify(token,process.env.SECRET_KEY,(err,usr) =>{
        if(err) {
            console.log("In JWT")
            return res.sendStatus(403);
        }

        req.user = usr;
        console.log(usr)
        next();
    })
    
}
app.listen(3000,()=>{
    console.log("Serever is Listening at port 3000")
})