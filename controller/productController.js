const Product = require("../Model/productModel");
const Category = require("../Model/categoryModel");
const Order = require('../Model/orderModel');
const fs = require("fs");
const { type } = require("os");
const sharp = require('sharp');
const { floor, ceil } = require("lodash");
const orderModel = require("../Model/orderModel");
const User = require('../Model/userModel');

function generateIds() {
  const digits = "0123456789";
  let id = "";

  for (let i = 0; i < 6; i++) {
    id += digits[Math.floor(Math.random() * 10)];
  }
  return id;
}


const loadProducts = async (req, res) => {
  try {
    const productData = await Product.find({isAvilable:true})
      .then((message) => {
        //console.log('in loadProducts   data then:>> ', message);
        console.log(message);
        res.status(200);
        res.render("product", { tittle: "Products", data: message });
      })
      .catch((err) => {
        console.log("in loadProducts   data err:>> ", err.message);
      });
  } catch (err) {
    console.log("in loadProducts :>> ", err.message);
  }
};

const loadAddProducts = async (req, res) => {
  try {
    const categoryData = await Category.find({ isAvailable: true });
    console.log("in add products :>> ");
    res.status(200);
    res.render("addProducts", { tittle: "Add Products", data: categoryData });
  } catch (err) {
    console.log("in loadAddProducts : " + err.message);
  }
};

const addproduct = async (req, res) => {
  
  try {
    console.log(req.files);
    const files = req.files;


    const mainImageFile = req.files['mainImage'][0].path;

      // Crop the main image
      const croppedMainImage = await sharp(mainImageFile)
      .resize(500, 500, {
        fit: 'cover',
        position: 'top'
      })
        .toBuffer();
  
      // Save the cropped main image
      const mainImageFilename = `cropped-${req.files['mainImage'][0].filename}`;
      await sharp(croppedMainImage)
        .toFile(`productImages/${mainImageFilename}`);

      const randromId = generateIds();
      const proid = "PRO"+randromId;

    const product = new Product({
      productId:proid,
      product_name: req.body.productName,
      price: req.body.price,
      description: req.body.description,
      mainImage:mainImageFilename,
      image: req.files['image'].map(file => file.filename), 
      category: req.body.category,
      size: req.body.size,
      color: req.body.color,
      quantity: req.body.quantity,
      brand: req.body.brandName,
    });
    const ProductData = await product.save();
    console.log("saved");
    res.redirect("/admin/products");
  } catch (err) {
    console.log("in add product controller: " + err.message);
  }
};

const loadEditProducts = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id)
    const data = await Product.find({ _id: id });
    const categoryData = await Category.find({ isAvailable: true });

    res.status(200);
    res.render("edit_product", { data: data, category: categoryData });
    console.log(data);
  } catch (err) {
    console.log("in load edit products : " + err.message);
  }
};

const deleteImage = async (req, res) => {
  try {
    const image = req.query.id;
    console.log(image);
    const data = await Product.find({ image: { $in: [image] } });
    console.log(data, "Data");
    try {
      const update = await Product.findOneAndUpdate(
        { image: { $in: [image] } },
        { $pull: { image: { $in: [image] } } }
      );
      console.log(update, "hihihihihhihhhihiiihi");
      // console.log(`${update.modifiedCount} docunt(s) updated`);
    } catch (error) {
      console.error("Error:", error);
    }
    const imagePath = `../productImages/${image}`;
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.log(err);
      }
    });
    console.log(data[0]._id)
    res.redirect(`/admin/products/edit_products?id=${data[0]._id}`);
  } catch (err) {
    console.log("in delete imGE:", err.message);
  }
};

const updateProducts = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const updatedata = {
      product_name: req.body.productName,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      size: req.body.size,
      color: req.body.color,
      quantity: req.body.quantity,
      brand: req.body.brandName,
    };
    if (req.files && req.files.length > 0) {
      const images = req.files.map((file) => file.filename);
      updatedata.image = images;
    }

    await Product.findByIdAndUpdate(id, updatedata);
    res.redirect("/admin/products");
  } catch (err) {
    console.log("in update product >> ", err.message);
  }
};

const listUnlist = async (req,res)=>{
    try{
        const id = req.query.id;
        const unlistProduct = await Product.findOne({_id:id},{isAvilable:1});
        console.log(unlistProduct.isAvilable)
        if(unlistProduct.isAvilable){
            console.log("in true")
            await Product.updateOne({_id:id},{$set:{isAvilable:false}})
            res.status(200);
            res.redirect('/admin/products');
        } else{
            console.log("false")
            await Product.updateOne({_id:id},{$set:{isAvilable:true}})
            res.status(200);
            res.redirect('/admin/products');
        }
    }catch(err){
        console.log('in unlistController : '+err.msg);
    }
}
const loadUnlistedProducts = async (req,res)=>{
  try{
    const unlistedProducts = await Product.find({isAvilable:false});
    res.render('unlistedProducts',{data:unlistedProducts});
  }catch(err){
    console.log("in load unlisted products >> : ",err.message );
  }
}

const loadOrders = async (req,res)=>{
  try{
    const pages = await Order.find().count();
    const count = ceil(pages/8);
    console.log(count);
    const orderdata = await Order.find().sort({createdAt:-1}).limit(8).skip(0);
    res.render('orderView',{data:orderdata,count});
  }catch(err){
    console.log('loadorders :>> ', err.message);
    res.status(500).send("Somrthing went wrong")
  }
   
}

const paginate = async (req,res)=>{
  console.log("req.query>>",req.query.count);
  if(req.query.count){
    const countPage = await Order.find(req.body.query).count();
    const count = ceil(countPage/8);
    console.log("countPage>>",countPage)
    res.json(count)
  }else{
    const orderdata = await Order.find(req.body.query).sort({createdAt:-1}).limit(req.body.limit).skip(req.body.skip);
    res.send(orderdata)
  }
}

const loadOrderview = async (req,res)=>{
  try{
   
    const orderId = req.query.id;
    console.log("orderId >> ", orderId)
    const orderData= await orderModel.findOne({orderId:orderId});
    console.log("orderData>>", orderData)
    const addresId = orderData.address;
    console.log("orderData.userId>>", orderData.userId)
    const userData = await User.findOne({_id:orderData.userId})
    console.log("userData>>", userData)
    const addressData = userData.address.items;
    const address = addressData.find((data) => data._id.toString() === addresId.toString());
    console.log("address",address)
    const addresString = address.HouseNum+" ,"+address.address+" ,"+address.city+" ,"+address.state+" ,"+address.pincode
   
    console.log("orderData >> ", orderData)
    res.render('order_view',{userdata:"hii",orderData,addresString,address,orderId})
}catch(err){
    console.log("loadOrder >> ", err.message)
}   
}
module.exports = {
  loadProducts,
  loadAddProducts,
  addproduct,
  loadEditProducts,
  deleteImage,
  updateProducts,
  listUnlist,
  loadUnlistedProducts,
  loadOrders,
  paginate,
  loadOrderview
};
