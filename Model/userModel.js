const mongoose = require('mongoose');
const productModel = require('./productModel');

const userSchema = new mongoose.Schema({
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
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    profileImage:{
        type:String
    },
    kart: {
        items: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: productModel
            },
            quantity: {
                type: Number,
                default: 1
            },
            price: {
                type: Number,
                require: true
            }
        }]
    },
    wishlist: {
        items: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: productModel
            },
            quantity: {
                type: Number,
                default: 1
            },
            price: {
                type: Number,
                require: true
            }
        }]
    },
       
    address: {
        items: [{
            name: {
                type: String,
                required:true
            },
            phone: {
                type:Number,
                required: true,
            },
            HouseNum: {
                type: String,
                require: true
            },
            pincode:{
                type:Number,
                required: true,
            },
            address:{
                type: String,
                required:true
            },
            city: {
                type: String,
                required:true
            },
            state: {
                type: String,
                required:true
            },
            landmark: {
                type: String
            },
            alternatePhone: {
                type:Number
            }
        }]
    }
});

module.exports = mongoose.model('user',userSchema);