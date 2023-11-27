const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name:{
        type: String,
        required : true
    },
    email:{
        type:String,
        requird:true,
        unique:true
    },
    phone:{
        type:Number,
        required: true,
        unique:true
        
    },
    password:{
        type: String,
        required:true,
    }
});

module.exports = mongoose.model('admin',adminSchema);