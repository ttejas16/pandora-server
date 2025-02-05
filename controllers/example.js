
function test(req,res){
    // actual logic goes in controllers
    console.log("this is a test controller");


    res.end("hello world");
}

module.exports = {
    test
}