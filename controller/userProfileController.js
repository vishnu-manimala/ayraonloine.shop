const { json } = require('express');
const User = require('../Model/userModel');
const Orders = require('../Model/orderModel');
const Products = require('../Model/productModel')
const Coupons = require('../Model/couponModel');
const fs = require("fs");
const sharp = require('sharp');


const Wallet = require('../Model/walletModel');

// (async function(){
//     const wallet = await Wallet.find()
//   console.log(wallet)
//   }())

const loadUserProfile = async (req,res)=>{
    try{
        const userdata =await User.findOne({_id:req.session.userId})
        console.log(userdata);
        res.render('userManager/user_profile',{userdata:userdata,page:0});

    }catch(err){
        console.log("in loadUserProfile >> ",err.message);
    }
}

const loadAddressManager = async (req,res)=>{
    try{
        const userdata =await User.findOne({_id:req.session.userId})
        if(userdata){
            console.log(userdata.address.items);
        res.render('userManager/address_manager',{userdata,page:0});
        }else{
            res.render('userManager/address_manager',{userdata,page:0});
        }
     
    }catch(err){
        console.log("in loadUserProfile >> ",err.message);
    }
   
}

const loadPancard = (req,res)=>{
    res.render('userManager/pancard',{userdata:"hii",page:0});
}

//LOAD ORDERS
const loadOrders = async (req,res)=>{
    try{
        const userId = req.session.userId;
        const userdata = await User.findById(userId);
        const orderDetails = await Orders.find({userId:userId}).sort({createdAt:-1});
        console.log("orderDetails >> ",orderDetails)
        res.render('userManager/orders',{userdata:"hii",orderDetails,userdata,page:0})
    }catch(err){
        console.log("in load orderslist >> ",err.message)
    }
   
}
const saveNewAddress = async (req,res)=>{
    console.log('in add address');
    try{
        if(req.query.id == "addressManager"){
                const userData = await User.findOne({_id:req.session.userId});
           
                const addressData = {
                    name: req.body.name,
                    phone:  req.body.phone,
                    HouseNum:  req.body.houseNum,
                    pincode:req.body.pincode,
                    address:req.body.addressTextarea,
                    city: req.body.city,
                    state: req.body.state,
                        landmark: req.body.landmark,
                        alternatePhone: req.body.alternatePhone
                    };
               
                    const address = await User.updateOne({_id:req.session.userId},{$push: { "address.items": addressData}});
                    if(address){
                    res.redirect('/profile/address_manager')
                    }else{
                        res.send("error")
                    }
        }else if(req.query.id == "api"){
            const userData = await User.findOne({_id:req.session.userId});
           
                const addressData = {
                    name: req.body.data.name,
                    phone:  req.body.data.phone,
                    HouseNum:  req.body.data.houseNumber,
                    pincode:req.body.data.pincode,
                    address:req.body.data.adddress,
                    city: req.body.data.city,
                    state: req.body.data.state,
                    landmark: req.body.data.landmark,
                    alternatePhone: req.body.data.alternatePhone

                    };
               
                    const address = await User.updateOne({_id:req.session.userId},{$push: { "address.items": addressData}});
                    console.log("in save address api>>  ",address)
                    if(address. modifiedCount){
                        res.send(addressData)
                    }else{
                        res.send("");
                    }
            }
    }catch(err){
        console.log("in add address >> ",err.message)
    }
}

const profileImageUpload  = async (req,res)=>{
    
    try{
        const file = req.file;
        const fileName = file.filename;
        console.log("photo",req.file);
        const mainImageFile = req.file.path;

        const croppedMainImage = await sharp(mainImageFile)
        .resize(500, 500, {
          fit: 'cover',
          position: 'top'
        })
          .toBuffer();

          const mainImageFilename = `cropped-${req.file.filename}`;
          await sharp(croppedMainImage)
            .toFile(`productImages/${mainImageFilename}`);
            console.log("photo",mainImageFilename);

            const userdata = await User.findById(req.session.userId);
           userdata.profileImage = mainImageFilename;
           const trial = await userdata.save();
           console.log("trial",trial);

      res.redirect('/user_profile');

    }catch(err){
        console.log("prof image upload >> ",err.message);
    }
}
const loadcancelmsg = (req,res)=>{
    if(req.query.id === "return"){
        res.render('cancelled',{userdata:"Return requested",page:0})
    }else if(req.query.id === "cancel"){
        res.render('cancelled',{userdata:"Order cancelled",page:0})
    }
    
}



const loadCheckout = async (req,res)=>{
    const id= req.session.userId;
   
    try{
        const walletdata = await Wallet.findOne({userId:req.session.userId})
        console.log("walletdata >>",walletdata.cash)
        console.log("walletdata >>",walletdata)
        let totalItems = 0;
        const userdata = await User.findById(id)
        console.log("userdata >> ",userdata)
        const currentDate = new Date();
            console.log("kart >> ",userdata.kart)
            const kartArray = new Array();
            let totalPrice=0;
            const kaItems = userdata.kart.items;
            kaItems.forEach(element => {
                kartArray.push(element.productId);
                totalPrice+= parseInt(element.price)*parseInt(element.quantity);
                console.log("totalPrice >> ", totalPrice)
                totalItems+=parseInt(element.quantity);
            });
            console.log("kart array >> ", kartArray)
            const productdata = await Products.find({_id:{$in: kartArray}})
            const coupons = await  Coupons.find({isBlocked:false});
            console.log("coupons data ",coupons);
            let availableCoupons=new Array();
            coupons.forEach((date)=>{
                const exp = new Date(date.expiryDate)
                const bool = exp >= currentDate
                const value = ((totalPrice >= date.minValue) && (totalPrice<=date.maxValue))
                console.log("value", value)
                console.log(bool && value);
                if( bool && value){
                    availableCoupons.push(date) ;
                }
            })
            
            //wallet DAta
            
            
           
            console.log('availablecoupons >> ',availableCoupons)
            res.render('productManager/checkout',{userdata:userdata, productData:productdata,coupons:availableCoupons,totalPrice,walletdata,totalItems,page:0})
           
            
          
     
    }catch(err){
        console.log('in loadcheckout >>', err.message);
       
    }  
}

const orderInvoice = async (req,res)=>{
    
}

module.exports = {
    loadUserProfile,
    loadAddressManager,
    loadPancard,
    loadOrders,
    saveNewAddress,
    profileImageUpload,
    loadcancelmsg,
    loadCheckout,
    orderInvoice
}