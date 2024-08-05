const mongoose = require('mongoose');

module.exports = async(req, res)=>{
    try{
        await mongoose.connect('mongodb+srv://vishnu:19rbYHoCl3uC547I@ayra.ovkdvo3.mongodb.net/Ayra',{
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

