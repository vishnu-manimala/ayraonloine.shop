const User = require('../Model/userModel');
const Products = require('../Model/productModel')
const OrderModel = require('../Model/orderModel')
const Razorpay = require('razorpay');
const key_id = "rzp_test_0wPeTmtyc9nQDT";
const key_secret = "vH3hgvmM5FDh83KoeIwuDrSJ";
const Coupon = require('../Model/couponModel');
const Wallet = require('../Model/walletModel');

function generateIds() {
    const digits = "0123456789";
    let id = "";
  
    for (let i = 0; i < 6; i++) {
      id += digits[Math.floor(Math.random() * 10)];
    }
    return id;
  }

const updateProfildata = async (req,res)=>{
    console.log(req.body);
    try{
        const data = await User.updateOne({_id:req.session.userId},req.body.updateQuery);
        if(data){
            res.send(data)
        }else{
            res.send("error")
        }
    }catch(err){
        console.log("in userupdateprofile api >> ", err.message)
    }
}

const updateAddress = async (req,res)=>{
  try{
  
    console.log(req.body.data);
    const userdata = await User.findById(req.session.userId);
    const address = userdata.address.items.id(req.body.editAddreesId)
    if(!address){
        console.log("not found")
    }
    address.name=req.body.data.name;
    address.phone = req.body.data.phone;
    address.HouseNum  = req.body.data.HouseNum;
    address.pincode  = req.body.data.pincode;
    address.address = req.body.data.address;
    address.city  = req.body.data.city;
    address.state  = req.body.data.state;
    address.landmark  = req.body.data.landmark;
    address.alternatePhone   = req.body.data.alternatePhone;

    const data = await userdata.save();
    res.send(data);
  }catch(err){
    console.log("in update address >> ", err.message)
  }
  
}

const deleteAddress =  async (req,res)=>{

    console.log(req.body.id)
    const addressId = req.body.id;
   
    const user = await User.findById(req.session.userId)
    console.log(user);
    const addressIndex = user.address.items.findIndex(address => address._id.equals(addressId));
    // if(!addressIndex){
    //     throw new Error('Address not found');
    // }
    try{

    user.address.items.splice(addressIndex, 1);

    const deleteAddress = await user.save();
    console.log(deleteAddress)
    res.send(deleteAddress)
    }catch(err){
        console.log("in delete address >> ", err.message)
    }
}

let newOrder;
let walletAmount=0;
let updation = {};
let usage={};
let update = {}
const saveOrder = async (req,res)=>{
   
   try{
        console.log("save order >> ",req.body)
        const data = req.body;
        const currentDate = new Date();
        const id = req.session.userId;
        const userdata = await User.findById(id);
        const deliveryDate = new Date();
        deliveryDate.setDate(currentDate.getDate() + 5);
        const cart = userdata.kart.items;
        console.log("cart>> ",cart)
        console.log("########## ")
        const cartProductIds = cart.map(item => item.productId.toString());
        const cartProducts = await Products.find({ _id: { $in: cartProductIds } });
       
        const odid = generateIds();
        const ID = "ORD"+odid;

        //data for Order model
        const userId = userdata._id;
        const addressId = data.selectAddresId;
        const status = "confirm";
        const method = data.paymentMethod;
        const amount = data.totalPriceValue;
        console.log("###### TOtalprice >> ", amount);
        let actual = 0;
        const date = currentDate;
        const expectedDelivery = deliveryDate;
            //product details
        const updatedProductArray = [];
        for (const productObj of cartProducts) {
            console.log("productObj >> ",productObj)
            console.log("########## ")
            const cartObj = cart.find((cartItem) => cartItem.productId.toString() === productObj._id.toString());
            console.log(cartObj)
            const updatedProductObj = {
                id:productObj._id,
                p_name:productObj.product_name,
                price:cartObj ? (productObj.price * cartObj.quantity) : 0,
                image:productObj.image,
                category:productObj.category,
                size:productObj.size,
                color:productObj.color,
                quantity:cartObj.quantity,
            }
            actual+= cartObj ? (productObj.price * cartObj.quantity) : 0,
            // Add the updated product object to the new array
            updatedProductArray.push(updatedProductObj);  
              
        }
        let addWallet = (3* parseInt(data.totalPriceValue))/100;
        console.log("addWallet",addWallet)
        walletAmount = parseInt(data.cashInWallest)+addWallet;
        console.log("walletAmount",walletAmount)
        const payment = {
            method: method,
            amount: amount,
            actualAmount: actual
        };
        //wallet model
         

        //order model
        newOrder = new OrderModel({
            orderId:ID,
            userId:userId,
            address:addressId,
            status:status,
            products:updatedProductArray,
            payment:payment,
            createdAt:date,
            expectedDelivery:expectedDelivery
        })
        if(data.selctedCoupondata){
            console.log(data.selctedCoupondata)
            const CouponId = data.selctedCoupondata._id;
            const coupondata = await Coupon.findById(CouponId);
            coupondata.userId.push(id);
            await coupondata.save();
       
        }
        
     
       

        console.log("########## ")
        console.log("newOrder >> ",newOrder)
        //check payment method to proceed
        console.log("########## ")
        console.log("method >> ",method)
        if (method === "UPI") {
           
            const instance = new Razorpay({
                key_id: key_id,
                key_secret: key_secret
            });
            let order = await instance.orders.create({
                amount: amount * 100,
                currency: "INR",
                receipt: 'new id u want to impliment',
            })
            console.log("########## ")
            console.log("order >> ",order)
            res.json(order);
            
        }else if (method === "COD") {

           const newOrderS =  await newOrder.save();
           usage={
            orderId:newOrderS._id,
            usedAmount:data.usedAmount,
            date:currentDate
        }
        updation={
                    orderId:newOrderS._id,
                    addedAmount:addWallet,
                    date:currentDate
                }
        update = {
            $set:{
                cash:walletAmount,
                $push:{
                    'usage.orders':usage
                },
                $push:{
                    'updation.orders':updation
                },
            }
        }
        
           const updateWalletD= await Wallet.updateMany({userId:req.session.userId},update);
           console.log("########## ")
           console.log("updateWalletD >> ",updateWalletD)
            
            for (const products of cartProducts) {
                console.log("########## ")
                console.log("products >> ",products)
                const cartObj = cart.find((cartItem) => cartItem.productId.toString() === products._id.toString());
                  
                  products.quantity = products.quantity-cartObj.quantity;
                  await products.save()
            }
            userdata.kart.items = [];
            await userdata.save();
            res.json(newOrder);
        }else{
            res.send("individual payment")
        }

      
    }catch(err){
        console.log("in save order >> ", err)
        res.json("err")
    }
   
}

const saveOrderUpi = async (req,res)=>{
    try{

        //save new order
        await newOrder.save();

        //update wallet
        console.log("update>>",usage,updation,walletAmount);
        const updateWalletD= await Wallet.updateMany({userId:req.session.userId},update);
        console.log("########## ")
        console.log("updateWalletD >> ",updateWalletD)
        const id = req.session.userId;
        const userdata = await User.findById(id);
        const cart = userdata.kart.items;
        const cartProductIds = cart.map(item => item.productId.toString());
        const cartProducts = await Products.find({ _id: { $in: cartProductIds } });
        for (const products of cartProducts) {
            console.log("########## ")
            console.log("products >> ",products)
            const cartObj = cart.find((cartItem) => cartItem.productId.toString() === products._id.toString());
              
              products.quantity = products.quantity-cartObj.quantity;
              await products.save()
        }
        userdata.kart.items = [];
        await userdata.save();
        res.json(newOrder);

    }catch(err){
        console.log("in save order upi >>", err.message)
        res.status(500).send('An error occurred while saving the order and updating product quantities');
    } 
}

const updateQuantity = async (req,res)=>{
    try{
        const data = req.body;
        const userId = req.session.userId;
        const userdata= await User.findById(userId);
        const cartData = userdata.kart.items;
        const cartItem = userdata.kart.items.id(data.cartId);
        const productId =  cartItem.productId;
        const productData = await Products.findById(productId);
        const proQuantity = productData.quantity;
        if(data.count>proQuantity){
            res.json("QuantityExceeded");
        }else{
            cartItem.quantity = data.count;
            await userdata.save();
            res.json("success");
        }
    
    }catch(err){
        console.log("update Quantity>>",err.message);
        res.status(500).json({ error: 'An error occurred while updating the quantity.' });
    }
}

//Admin setStatus
const setStatus = async (req,res)=>{
    try{
        const body = req.body;
        console.log("in set status>> ", body);
        const id=body.orderId;
        const status = body.status;
        const updateStatus = await OrderModel.findByIdAndUpdate(id,{$set:{status:status}})
        res.json("ok");
    }catch(err){
        console.log('in set status >>',err.message);
    }
   }

const checkQuantity = async (req,res)=>{

    try{
        const userdata= await User.findById(req.session.userId,{kart:1});
       
        const cart = userdata.kart.items;
        console.log(cart)
        const productIds = cart.map(item => item.productId.toString());
        const productdata = await Products.find({_id:{$in:productIds}});
        let stock=0;
        for (const products of productdata) {
            const cartObj = cart.find((cartItem) => cartItem.productId.toString() === products._id.toString());
              
              if(products.quantity<cartObj.quantity || products.quantity == 0 ){
                res.json("outofstock");
                stock =0;
                break;
              }else{
                stock++
              }
        }
        if(stock>0){
            res.json("stock");
        }

        console.log(productdata)
    }catch(err){
        console.log("in checkQuantity >>", err.message);
    }
}

//fetch sales
const fetchSales = async (req,res)=>{
    
    const body = req.query.id;
    console.log(req.body);
    let salesData = new Array();

    //On DOM Loading  **********************************
    if(body === "Full"){
        
        const orderdata = await OrderModel.find();
        console.log("###########################################")
        console.log("in fetchSales",orderdata);
        const totalDelivery = orderdata.filter(data=>data.status==="Delivered")
        const totalCancelled = orderdata.filter(data=>data.status==="cancel");
        const totalReturn = orderdata.filter(data=>data.status==="returned");
        const chartdata = [
            { label: 'Delivered', value:totalDelivery.length  },
            { label: 'cancel', value: totalCancelled.length },
            { label: 'returned', value: totalReturn.length }
            // Add more data as needed
          ];
        res.json(chartdata);


     //On selecting monthly ***************************   
    }else  if(body === "Monthly"){
        const month = req.body.month;
        console.log("month>> ",month);
        const startofmonth = new Date(month);
        const endofmonth = new Date(month);
        console.log("startofmonth>> ",startofmonth);
       
        endofmonth.setMonth(endofmonth.getMonth()+1);
        console.log("endofmonth>> ",endofmonth);
        const orderdata = await OrderModel.find( {createdAt: {
                      $gte: startofmonth,
                      $lte: endofmonth
                    }});

        console.log("Monthly>>",orderdata)

        const totalDelivery = orderdata.filter(data=>data.status==="Delivered")
        const totalCancelled = orderdata.filter(data=>data.status==="cancel");
        const totalReturn = orderdata.filter(data=>data.status==="returned");
        const chartdata = [
                        { label: 'Delivered', value:totalDelivery.length  },
                        { label: 'cancel', value: totalCancelled.length },
                        { label: 'returned', value: totalReturn.length }
                        // Add more data as needed
                      ];
                  const chart = {
                    Delivered:totalDelivery.length,
                    cancel:totalCancelled.length,
                    returned:totalReturn.length,
                    total:orderdata.length
                  }
                     
                      
        res.json(chartdata);


      
        //   console.log("#####sales>>>>>> ",sales);

         
    }
} 



module.exports = {
    updateProfildata,
    updateAddress,
    deleteAddress,
    saveOrder,
    saveOrderUpi,
    updateQuantity,
    setStatus,
    checkQuantity,
    fetchSales,
   
}