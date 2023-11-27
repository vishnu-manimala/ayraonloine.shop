const userModel = require('../Model/userModel');
const orderModel = require('../Model/orderModel');
const {  mongoose } = require('mongoose');

const walletSchema = new mongoose.Schema({
   
        cash:{
            type:String,
            default:0
        },
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:userModel,
            required:true
        },
        username:{
            type:String,
            required:true
        },
        usage:{
            orders:[{
                orderId:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:orderModel
                },
                usedAmount:{
                    type:String,
                    default:0
                },
                date:{
                    type: Date,
                    immutable: true,
                    default: () => Date.now()
                }
    
                }]
            
           },
       updation:{
        orders:[{
            orderId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:orderModel
            },
            addedAmount:{
                type:String,
                default:0
            },
            date:{
                type: Date,
                immutable: true,
                default: () => Date.now()
            }

            }]
        
       }
           
   
})

module.exports = mongoose.model('Wallet',walletSchema);