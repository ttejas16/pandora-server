const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.cookies.accessToken;
    // console.log(req)
    // console.log("In Middle waree VerifyToken \n THis is the token " + token);

    let user = {};
    try {
        if (token && jwt.verify(token, process.env.SECRET_KEY)) {
            const payload = jwt.decode(token);

            user = {
                ...payload
            }
        }
        
        
    } catch (err) {
        console.log("token expired or is invalid");
    }
    
    req.user = user;
    next();
}

module.exports = { verifyToken };