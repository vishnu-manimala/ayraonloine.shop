const { query } = require('express');
const Products = require('../Model/productModel');
const User = require('../Model/userModel');
const Orders = require('../Model/orderModel');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { ceil } = require('lodash');
const Coupons = require('../Model/couponModel');




const loadCategory = async (req,res)=>{
console.log("in filter")
    const categoryFilter = req.query.category;
    console.log(categoryFilter)
    const productsData = await Products.find({$and:[{category:categoryFilter},{isAvilable:true}]});
    console.log("productsData>>",productsData)
    res.send({productsData})
}

const productView = async (req,res) =>{
    try{
       
        console.log("in product view",req.query.id );
     
        const id= req.params.id
        const userData = await User.findOne({_id:req.session.userId})
        const productDetail = await Products.findOne({$and:[{_id:id},{isAvilable:true}]});
        console.log(productDetail);
        res.render('viewProduct',{data:productDetail, userdata: userData,page:0});
    }catch(err){
        console.log("in productView >> ",err.message);
    }
}

const loadFilter = async (req,res)=>{
   console.log("in filter >>",req.body);
   const categories = req.body.category;
   const sort = req.body.sort;
   const search = req.body.search;
   let filterData = "";
   if(sort){
        if(sort == 1){
            filterData =  await Products.find({$and:[{ category: { $in: categories } },{isAvilable:true}]}).sort({price: 1});
        }else if(sort == -1){
            filterData =  await Products.find({$and:[{ category: { $in: categories } },{isAvilable:true}]}).sort({price: -1});
        }
        
   }else{
        filterData =  await Products.find({$and:[{ category: { $in: categories } },{isAvilable:true}]})
   }
   console.log("filtered data",filterData)
   res.send(filterData);
}

const addToBag = async (req,res)=>{
    console.log("in add to bag>> ",req.query)
    try{
    if(req.session.userId){
        const productData = await Products.findOne({_id:req.query.id});
        const userData = await User.findOne({_id:req.session.userId});
        const cartItems = userData.kart.items;
        const existingCartItem = cartItems.find(item => item.productId.toString() === req.query.id);
        if(existingCartItem){
            console.log("exists");
            res.send(JSON.stringify("exists"));
        }else{
            const kartData = {
                productId: req.query.id,
                price: productData.price
            };
            console.log( kartData)
            userData.kart.items.push(kartData);
            
            
            const kart = await userData.save();
            console.log(kart);
            if(kart){
                res.send(JSON.stringify(kart))
            }else{
                res.send(JSON.stringify("error"));
            }
        }    
    }else {
       
        res.send(JSON.stringify("login"))
    }
}catch(err){
    console.log("in addto bag>> ", err.message);
}
}


const addToWishlist = async (req,res)=>{
    console.log("in add to bag>> ",req.query)
    try{
    if(req.session.userId){
        const productData = await Products.findOne({_id:req.query.id});
        const userData = await User.findOne({_id:req.session.userId});
        const wishlistItems = userData.wishlist.items;
        const existingWishlistItem = wishlistItems.find(item => item.productId.toString() === req.query.id);
        if(existingWishlistItem){
            console.log("exists");
            res.send(JSON.stringify("exists"));
        }else{
            const kartData = {
                productId: req.query.id,
                price: productData.price
            };
            console.log( kartData)
            userData.wishlist.items.push(kartData);
            
            
            const kart = await userData.save();
            console.log(kart);
            if(kart){
                res.send(JSON.stringify(kart))
            }else{
                res.send(JSON.stringify("error"));
            }
        }    
    }else {
       
        res.send(JSON.stringify("login"))
    }
}catch(err){
    console.log("in addto bag>> ", err.message);
}
}


const loadWishlist = async (req,res) =>{
    try{  
        const userData = await User.findOne({_id:req.session.userId})
        console.log("in load wishlist :",userData)
        const wishlistData = userData.wishlist.items;

        console.log("wishlist data :",wishlistData);
        const productId = wishlistData.map(items => items.productId);
        const productDetails = await Products.find({ _id: { $in: productId } });
        console.log("wishlist product data",productDetails);
        res.render('wishlist',{data:productDetails, userdata: userData,page:0});
    }catch(err){
        console.log("in load wishlist >> ",err.message);
    }
}

const deleteWishlist = async (req,res)=>{
    console.log("in delete wishlist>> ",req.query.productId)
    try{
        if(req.session.userId){
            const userId = req.session.userId;
            console.log(userId)
            const productId = req.query.productId;
            console.log("productId",productId)
        
                const userData = await User.updateOne(
                    { _id: req.session.userId },
                    { $pull: { 'wishlist.items': { productId: productId } } }
                );
            // console.log(userData)
            res.redirect('/wishlist')
        
        }else {
            res.send(JSON.stringify("login"))
        }
    }catch(err){
        console.log("in delete wishlist>> ", err);
        }
    };

const loadKart = async (req,res) =>{
    try{  
        const userData = await User.findOne({_id:req.session.userId})
        console.log("in load kart :",userData)
        const kartData = userData.kart.items;
        let Outofstock =0;
        console.log("kartData :",kartData);
        const productId = kartData.map(items => items.productId);
        const productDetails = await Products.find({ _id: { $in: productId } });
        console.log("kartD product data",productDetails);
        let product = new Array();
        for (const productObj of productDetails) {
            const cartObj = kartData.find((cartItem) => cartItem.productId.toString() === productObj._id.toString());
           if(productObj.quantity<1){
            Outofstock++;
           }
             updatedProductObj = {
                productId:productObj._id,
                cartId:cartObj._id,
                p_name:productObj.product_name,
                price:productObj.price,
                image:productObj.image,
                category:productObj.category,
                size:productObj.size,
                color:productObj.color,
                quantity:cartObj.quantity,
                totalQuantity:productObj.quantity
            }
            // Add the updated product object to the new array
            product.push(updatedProductObj);  
              
        }
        console.log("product",product);
        res.render('kart',{data:productDetails, userdata: userData,product:product,Outofstock,page:0});
    }catch(err){
        console.log("in load kart>> ",err.message);
    }
}

const deleteKart = async (req,res)=>{
    console.log("in delete kart>> ",req.query.productId)
    try{
        if(req.session.userId){
            const userId = req.session.userId;
            console.log(userId)
            const productId = req.query.productId;
            console.log("productId",productId)
        
                const userData = await User.updateOne(
                    { _id: req.session.userId },
                    { $pull: { 'kart.items': { productId: productId } } }
                );
            // console.log(userData)
            res.redirect('/kart')
        
        }else {
            res.redirect('/login')
        }
    }catch(err){
        console.log("in delete wishlist>> ", err);
        }
    };

    const loadFilterpagination = async (req,res)=>{
        try{
            const query = req.body.queryData;
            const skipValue = req.body.skipNumber;
            const limitValue = req.body.limitNumber;
            const sortQury = req.body.sortQuery
            let countValue;
            if(req.query.count==1){
               countValue= await Products.find(query).count();
               console.log(countValue);
               let countValues= ceil(countValue/6);
               res.send(JSON.stringify(countValues));
            }else{
                console.log("sortQury",sortQury)
                let filterData;
                if(sortQury){
                    filterData =  await Products.find(query).sort(sortQury).limit(limitValue).skip(skipValue);
                }else{
                    filterData =  await Products.find(query).limit(limitValue).skip(skipValue);
                }
                console.log("filterData",filterData)
                console.log("skipValue",skipValue)
                console.log("limitValue",limitValue)
                console.log("sortQury",sortQury)
                res.send(filterData);
            }
        }catch(err){
            console.log('in load filter >>',err.message);
        }
    }

//    const loadCheckout = async (req,res)=>{
//         const id= req.session.userId;
//         // const walletdata = await Wallet.find({userId:req.session.userId})
//         // console.log("walletdata >>",walletdata)
//         try{
//             const userdata = await User.find({_id:id})
//             const currentDate = new Date();
//                 console.log("kart >> ",userdata.kart)
//                 const kartArray = new Array();
//                 let totalPrice=0;
//                 const kaItems = userdata.kart.items;
//                 kaItems.forEach(element => {
//                     kartArray.push(element.productId);
//                     totalPrice+= parseInt(element.price)*parseInt(element.quantity);
//                     console.log("totalPrice >> ", totalPrice)
//                 });
//                 console.log("kart array >> ", kartArray)
//                 const productdata = await Products.find({_id:{$in: kartArray}})
//                 const coupons = await  Coupons.find({isBlocked:false});
//                 console.log("coupons data ",coupons);
//                 let availableCoupons=new Array();
//                 coupons.forEach((date)=>{
//                     const exp = new Date(date.expiryDate)
//                     const bool = exp >= currentDate
//                     const value = ((totalPrice >= date.minValue) && (totalPrice<=date.maxValue))
//                     console.log("value", value)
//                     console.log(bool && value);
//                     if( bool && value){
//                         availableCoupons.push(date) ;
//                     }
//                 })
                
//                 //wallet DAta
                
                
               
//                 console.log('availablecoupons >> ',availableCoupons)
//                 res.render('productManager/checkout',{userdata:userdata, productData:productdata,coupons:availableCoupons,totalPrice})
               
                
              
         
//         }catch(err){
//             console.log('in loadcheckout >>', err.message);
           
//         }  
//    }

  const loadSuccess = async (req,res)=>{

        try{
            console.log(req.query.id);
            const orderId = req.query.id;
            res.render('productManager/success',{userdata:"hey",orderId,page:0});
        }catch(err){
            console.log("in loadSuccess >> ",err.message);
        }
    
    }
// const loadOrder = async(req,res)=>{
//     try{
//         const userId = req.session.userId;
//         const orderId = req.query.id;
//         console.log("orderId >> ", orderId)
//         const orderData= await Orders.findById(orderId);
//         const addresId = orderData.address;
//         const userData = await User.findOne({_id: userId})
//         const addressData = userData.address.items;
//         const address = addressData.find((data) => data._id.toString() === addresId.toString());
//         console.log("address",address)
//         const addresString = address.HouseNum+" ,"+address.address+" ,"+address.city+" ,"+address.state+" ,"+address.pincode
       
//         console.log("orderData >> ", orderData)
//         res.render('productManager/orderview',{userdata:"hii",orderData,addresString,address,orderId})
//     }catch(err){
//         console.log("loadOrder >> ", err.message)
//     }   
// }

// const cancelReturnOrder = async (req,res)=>{
//     try{
//         const body = req.body;
//         const id = body.id;
     
//         console.log("cancelReturnOrder >> ",body);
//         const orderData = await Orders.findById(id,{products:1,_id:0});
//         console.log("cancelReturnOrder: order >> ",orderData);
//         let productIds = new Array(); 
//         orderData.products.forEach(element => {
//                 productIds.push(element.id);
//             });
            
//             console.log("cancelReturnOrder: productIds >> ",productIds);
//        const ProductData = await Products.find({_id:{$in:productIds}})
//        console.log("cancelReturnOrder: ProductData >> ",ProductData);
       
   
//         //checking status to update
//         if(body.status === "return"){
//             update = {$set:{status:"return requested",orderCancelReason:body.selectedValue, orderReturnRequest:true}}
           
           
//         }else if(body.status === "cancel"){
//             update={$set:{status:body.status,orderReturnReason:body.selectedValue,orderCancleRequest:true}}
//         }

     
//         if(body.selectedValue !== "product defect"){
//             productIds.forEach(async (data)=>{
//                         const product = ProductData.find(element=>element._id.toString() === data.toString())
//                         const orderedProduct = orderData.products.find(element=>element.id.toString() === data.toString())
//                         console.log("product>> ",product)
//                         console.log("orderedProduct>> ",orderedProduct)
//                         const updateQuantity = parseInt(product.quantity) +parseInt(orderedProduct.quantity);
//                         console.log("updateQuantity>> ",updateQuantity)
//                         product.quantity = updateQuantity;
//                         const update = await Products.findByIdAndUpdate(data,{$set:{quantity:updateQuantity}})
//                         console.log("update>> ",update)
//                        })
//         }
//         const updateStatus = await Orders.findByIdAndUpdate(id,update);
//         console.log("updateStatus>> ",updateStatus)
//         if(updateStatus){
//             res.json("done");
//         }else{
//             res.json("wrong");
//         }
        

//     }catch(err){
//         console.log("in cancel or return >> ",err.message);
//         res.json("something went wrong");
//     }
    
// }


module.exports = {
    loadCategory,
    productView,
    loadFilter,
    addToBag,
    addToWishlist,
    loadWishlist,
    deleteWishlist,
    loadKart,
    deleteKart,
    loadFilterpagination,
    //loadCheckout,
    loadSuccess,
    // loadOrder,
    // cancelReturnOrder
    }