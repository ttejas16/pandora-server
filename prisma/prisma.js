const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testDatabase(){
    try {
        const _ = await prisma.$connect();
        console.log("postgres connected");
        
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = {
    prisma,
    testDatabase
}