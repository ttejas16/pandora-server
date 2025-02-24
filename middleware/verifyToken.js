const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.cookies.accessToken;
    // console.log(req)
    // console.log("In Middle waree VerifyToken \n THis is the token " + token);

    let user = {};
    try {
        if (token && jwt.verify(token, process.env.SECRET_KEY)) {
            const payload = jwt.decode(token);
            // console.log(jwt.verify(token, process.env.SECRET_KEY))
            // console.log("This is payload "+ payload)
            user = {
                ...payload
            }
            // console.log(user);

            //    console.log(user)
            // const newToken = jwt.sign({ user }, process.env.SECRET_KEY, { expiresIn: '10mins' });
            
            // res.cookie('accessToken', newToken, {
                //     httpOnly: true,
                //     secure: true,
                //     sameSite: "none",
            //     expires: new Date(Date.now() + 65 * 60 * 1000)
            // });
        }
        
        
    } catch (err) {
        console.log("token expired or is invalid");
        
        //console.log(err);
    }
    
    req.user = user;
    next();
}

module.exports = { verifyToken };