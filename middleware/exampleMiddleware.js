
function foo(req,res,next){
    console.log("ohh we are in a middle ware!");
    next();
}

module.exports = {
    foo
}