const mongoose = require('mongoose');

module.exports = async(req, res)=>{
    try{
        await mongoose.connect('mongodb://0.0.0.0:27017/Ayra',{
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
