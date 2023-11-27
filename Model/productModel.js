const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId:{
        type:String,
      
    },
    product_name:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true,
    },
    description:{
        type: String,
        
    },
    mainImage:{
        type:String,
        require:true
    },
    image:[{
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
        type: String,
        require: true
    },
    brand : {
        type: String,
        require:true
    },
    isAvilable:{
        type:Boolean,
        default:true,
        require:true
    }
});

module.exports = mongoose.model('products', productSchema);