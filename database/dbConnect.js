const mongoose = require('mongoose');
const MongoDB_URL = process.env.MONGODB_URL;

module.exports = async(req, res)=>{
    try{
        await mongoose.connect('mongodb+srv://vishnu:ayraonline@ayra.ovkdvo3.mongodb.net/?retryWrites=true&w=majority',{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(()=>{
            console.log("Server connected to database...");
        }).catch((err)=>{
            console.log(err)
        })
    } catch(err){
        console.log(err.message);
    }
}
