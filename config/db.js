const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()


const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Database Connected Successfully");
        return {
            success: true,
            message: "Database Connected Successfully"
        }

    } catch (error) {
        console.log("MongoDb Error : ", error);
        return {
            success: false,
            message: "Database Failed to Connect"
        }
    }
}

module.exports = connectDb 