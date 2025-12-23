const mongoose = require("mongoose")

//connecting to MongoDB
const connectDB = async () => {

    try{
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("Connected Successfully to Mongo DB !");
    }catch(err){
        console.error("Error connecting to MongoDB!", err);
        process.exit(1);
    }
    
}

module.exports = connectDB;