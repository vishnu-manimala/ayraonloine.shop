const mongoose = require("mongoose");
const userModel = require('./userModel');
const { productView } = require("../controller/userProductsController");
const productModel = require("./productModel");

const orderSchema = new mongoose.Schema({
    orderId:{
        type:String,
        required:true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: userModel
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: userModel
    },
    status: {
        type: String,
        default: "Processing"
    },
    orderCancleRequest: {
        type: Boolean,
        default: false
    },
    orderCancelReason:{
        type:String
    },
    orderReturnRequest: {
        type: Boolean,
        default: false
    },
    orderReturnReason:{
        type: String
    },
    products: [{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: productModel
        },
        p_name: {
            type: String,
            require: true
        },
        price: {
            type: String,
            require: true
        },
        image: [{
            type: String,
            require: true
        }],
        category: [{
            type: String,
            require: true
        }],
        size: {
            type: String,
            require: true
        },
        color: {
            type: String,
            require: true
        },
        quantity: {
            type: Number,
            require: true
        },
    }],
    payment: {
        method: {
            type: String,
        },
        amount: {
            type: String,
        },
        actualAmount: {
            type: String,
        }
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    },
    expectedDelivery: {
        type: Date,
    }
})


const orderModel = mongoose.model('order', orderSchema);
module.exports = orderModel;