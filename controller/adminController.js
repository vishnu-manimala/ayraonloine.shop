const Admin = require("../Model/adminModel");
const User = require("../Model/userModel");
const bcrypt = require("bcrypt");
const Coupon = require("../Model/couponModel");
const Wallets = require('../Model/walletModel');
const Orders  = require('../Model/orderModel');
const Products = require('../Model/productModel');
const exceljs = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const loadRegister = async (req, res) => {
  try {
    res.render("adminRegister");
  } catch (err) {
    console.log(err.message);
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const registerAdmin = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);
    const admin = new Admin({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.mobile,
      password: spassword,
    });
    const userData = await admin.save();
    console.log(userData);

    if (userData) {
      res.render("adminRegister", {
        message: "your registration is succesful",
      });
    } else {
      res.render("adminRegister", { message: "your registration is failed" });
    }
  } catch (err) {
    console.log(err.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render("loginAdmin");
  } catch (err) {
    console.log(err.message);
  }
};

const loginAdmin = async (req, res) => {
  try {
    const userData = await Admin.findOne({ email: req.body.email });
    req.session.admin_id = userData._id;
    req.session.username = userData.email;
    res.redirect("/admin/home");
  } catch (err) {
    console.log(err.message);
  }
};

const loadHome = async (req, res) => {
  try{

  const result = await Orders.find();
  const data1 = [
    { label: 'jan', value: 10 },
    { label: 'feb', value: 20 },
    { label: 'march', value: 15 },
    { label: 'april', value: 15 },
    { label: 'may', value: 15 },
    { label: 'june', value: 15 },
    { label: 'july', value: 15 },
    { label: 'aug', value: 15 },
    { label: 'sept', value: 15 },
    { label: 'oct', value: 15 },
    // Add more data as needed
  ];
  console.log(result)
  const totalOrders =  result.length;
  const totalUsers = await User.find().count();
  const totalProducts = await Products.find().count();
  const totalDelivery = result.filter(data=>data.status==="Delivered")
  const totalCancelled = result.filter(data=>data.status==="cancel");
  const totalReturn = result.filter(data=>data.status==="returned");
  let totalSaleAmount=0;
  totalDelivery.forEach(data=>{
    totalSaleAmount+=parseInt( data.payment.amount);
  })
  console.log("totalSaleAmount>>",totalSaleAmount)

  const data = {
    totalOrders:totalOrders,
    totalUsers:totalUsers,
    totalProducts:totalProducts,
    totalDelivery:totalDelivery.length,
    totalCancelled:totalCancelled.length,
    totalReturn:totalReturn.length,
    totalSaleAmount:totalSaleAmount
  }

result.forEach(element =>{


})

  res.render("adminHome",{data,data1});
}catch(err){
  console.log("in load admin home",err.message)
}
  //, { name: adminData.name, email: adminData.email });
  //}
  // const userId = req.session.admin_id;
  // try {
  //   const adminData = await Admin.findOne({ _id: userId });
  //   if (adminData) {
  //     res.render("adminHome", { name: adminData.name, email: adminData.email });
  //   }
  // } catch (err) {
  //   console.log(err.message);
  // }
};

const logout = (req, res) => {
  try {
    req.session.admin_id = null;
    res.redirect("/admin/login");
  } catch (err) {
    console.log(err.message);
  }
};

const loadUserData = async (req, res) => {
  try {
    const userData = await User.find({})
      .then((userData) => {
        res.status(200);
        res.render("users", { data: userData });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log("log user : " + err.message);
  }
};

const blockedUser = async (req, res) => {
  try {
    const id = req.query.id;

    const data = await User.findOne({ _id: id }, { isBlocked: 1 });
    console.log(data);
    if (data.isBlocked) {
      await User.updateOne({ _id: id }, { $set: { isBlocked: false } })
        .then((message) => {
          res.status(200);
          res.redirect("/admin/users");
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      const update = await User.updateOne(
        { _id: id },
        { $set: { isBlocked: true } }
      )
        .then((message) => {
          res.status(200);
          res.redirect("/admin/users");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  } catch (err) {
    console.log(err.message);
  }
};

const loadAddCoupons = async (req, res) => {
  try {
    const editId = req.query.id;
    if (editId) {
      const couponData = await Coupon.findById(editId);
      res.render("coupon_add", { couponData, formtittle: "Edit Coupon" });
    } else {
      res.render("coupon_add", { couponData: [], formtittle: "Add Coupon" });
    }
  } catch (err) {
    console.log("in load coupons>> ", err.message);
  }
};

const saveCoupons = async (req, res) => {
  const formdata = req.body;
  console.log("data >> ", formdata);
  try {
    const editId = req.query.id;
    let couponData;
    console.log("editId >> ", editId);
    if (editId) {
      couponData = await Coupon.findById(editId);

      console.log("couponData >> ", couponData);

      couponData.couponName = formdata.coupon_name;
      couponData.couponValue = formdata.offer;
      couponData.expiryDate = formdata.expiry_date;
      couponData.maxValue = formdata.max_value;
      couponData.minValue = formdata.min_value;

      console.log("couponData edited >> ", couponData);
    } else {
      couponData = new Coupon({
        couponName: formdata.coupon_name,
        couponValue: formdata.offer,
        expiryDate: formdata.expiry_date,
        maxValue: formdata.max_value,
        minValue: formdata.min_value,
        isBlocked: false,
      });
    }
    const responsecoupon = await couponData.save();
    if (responsecoupon) {
      res.redirect("/admin/coupons");
    }
  } catch (err) {
    console.log("in save coupons >> ", err.message);
  }
};

const loadCoupons = async (req, res) => {
  try {
    console.log(req.query.id);
    if (req.query.id) {
      const mode = "unlisted";
      const CouponData = await Coupon.find({ isBlocked: true });
      res.render("coupons", { CouponData, mode });
    } else {
      const mode = "";
      const CouponData = await Coupon.find({ isBlocked: false });
      res.render("coupons", { CouponData, mode });
    }
  } catch (err) {
    console.log("in loadCoupons >>", err.message);
  }
};

const manageCoupon = async (req, res) => {
  const body = req.body;
  console.log("body >>", body);
  try {
    if (body.mode === "delete") {
      const deleteCoupon = await Coupon.findByIdAndDelete(body.id);
      res.json("success");
    } else if (body.mode === "unlist") {
      const update = await Coupon.findByIdAndUpdate(body.id, {
        isBlocked: true,
      });
      res.json("success");
      const couponData = await Coupon.find({ isBlocked: false });
    }
  } catch (err) {
    console.log("in manage coupon api >>", err.message);
    res.json("err");
  }
};

//wallets

const loadWallets = async (req,res)=>{
  try{
    const walletData = await Wallets.find();
    console.log(walletData);
    res.render('userWallets',{data:walletData})
  }catch(err){
    console.log("in wallets>>",err.message)
  }
 

}
let startofmonth;
let endofmonth;
let targetDate;
let targetYear;
const report = async (req,res)=>{
  try{
    console.log("body",req.body)
    if(req.body.salesRe === "Monthly"){
        const month = req.body.month;
        console.log("month>> ",month);
         startofmonth = new Date(month);
         endofmonth = new Date(month);
        console.log("startofmonth>> ",startofmonth);
      
        endofmonth.setMonth(endofmonth.getMonth()+1);
        console.log("endofmonth>> ",endofmonth);
      
        const sales = await Orders.aggregate([
                {
                  $match: {
                    createdAt: {
                      $gte: startofmonth,
                      $lte: endofmonth
                    },
                    status: 'Delivered'
                  }
                },
                {
                  $unwind: '$products'
                },
                {
                  $group: {
                    _id: {
                      month: { $month: '$createdAt' },
                      year: { $year: '$createdAt' },
                      orderId: '$orderId'
                    },
                    productNames: { $push: '$products.p_name' },
                    category: { $push: '$products.category' },
                    quantity: { $sum: '$products.quantity' },
                    amount: { $first: '$payment.amount' } // Extract the amount from the payment subdocument
                  }
                },
                {
                  $project: {
                    _id: 0,
                    month: '$_id.month',
                    year: '$_id.year',
                    orderIds: '$_id.orderId',
                    productNames: 1,
                    category: 1,
                    quantity: 1,
                    amount: 1
                  }
                }
              ]);
              const heading = "Monthly Report";
              console.log("in report>> ",sales)
              res.render('salesReport',{sales,heading})
    }else  if(req.body.salesRe === "Daily"){
        
          const day = req.body.today;  
           targetDate = new Date(day);  
          console.log(targetDate)
          const query = {
            createdAt: {
              $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
              $lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
            },
          };
          //const sales1 = await Orders.find(query)
          const sales = await Orders.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
                  $lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
                },
                status: 'Delivered'
              }
            },
            {
              $unwind: '$products'
            },
            {
              $group: {
                _id: {
                  month: { $month: '$createdAt' },
                  year: { $year: '$createdAt' },
                  orderId: '$orderId'
                },
                productNames: { $push: '$products.p_name' },
                category: { $push: '$products.category' },
                quantity: { $sum: '$products.quantity' },
                amount: { $first: '$payment.amount' } // Extract the amount from the payment subdocument
              }
            },
            {
              $project: {
                _id: 0,
                month: '$_id.month',
                year: '$_id.year',
                orderIds: '$_id.orderId',
                productNames: 1,
                category: 1,
                quantity: 1,
                amount: 1
              }
            }
          ]);
          console.log("sales>>> ",sales)
          const heading = "Daily Report";
          
          res.render('salesReport',{sales,heading})

    }else  if(req.body.salesRe === "Yearly"){
      
      
           targetYear = req.body.year  
          console.log(targetYear)
          
          //const sales1 = await Orders.find(query)
          const sales = await Orders.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date(targetYear, 0, 1),
                  $lt: new Date(targetYear + 1, 0, 1),
                },
                status: 'Delivered'
              }
            },
            {
              $unwind: '$products'
            },
            {
              $group: {
                _id: {
                  month: { $month: '$createdAt' },
                  year: { $year: '$createdAt' },
                  orderId: '$orderId'
                },
                productNames: { $push: '$products.p_name' },
                category: { $push: '$products.category' },
                quantity: { $sum: '$products.quantity' },
                amount: { $first: '$payment.amount' } // Extract the amount from the payment subdocument
              }
            },
            {
              $project: {
                _id: 0,
                month: '$_id.month',
                year: '$_id.year',
                orderIds: '$_id.orderId',
                productNames: 1,
                category: 1,
                quantity: 1,
                amount: 1
              }
            }
          ]);
          console.log("sales>>> ",sales)
          const heading = "Yearly Report";
          
          res.render('salesReport',{sales,heading})
    }
  }catch(err){
          console.log("in report>> ",err.message)
  }
}

const download = async (req,res)=>{
    try{
      let sales;
      console.log(req.body.mode);
      const mode = req.body.mode;
      if(mode === 'Monthly'){
         sales = await Orders.aggregate([
                {
                  $match: {
                    createdAt: {
                      $gte: startofmonth,
                      $lte: endofmonth
                    },
                    status: 'Delivered'
                  }
                },
                {
                  $unwind: '$products'
                },
                {
                  $group: {
                    _id: {
                      month: { $month: '$createdAt' },
                      year: { $year: '$createdAt' },
                      orderId: '$orderId'
                    },
                    productNames: { $push: '$products.p_name' },
                    category: { $push: '$products.category' },
                    quantity: { $sum: '$products.quantity' },
                    amount: { $first: '$payment.amount' } // Extract the amount from the payment subdocument
                  }
                },
                {
                  $project: {
                    _id: 0,
                    month: '$_id.month',
                    year: '$_id.year',
                    orderIds: '$_id.orderId',
                    productNames: 1,
                    category: 1,
                    quantity: 1,
                    amount: 1
                  }
                }
              ]);

            }if(mode === 'Daily'){

              sales = await Orders.aggregate([
                {
                  $match: {
                    createdAt: {
                      $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
                      $lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
                    },
                    status: 'Delivered'
                  }
                },
                {
                  $unwind: '$products'
                },
                {
                  $group: {
                    _id: {
                      month: { $month: '$createdAt' },
                      year: { $year: '$createdAt' },
                      orderId: '$orderId'
                    },
                    productNames: { $push: '$products.p_name' },
                    category: { $push: '$products.category' },
                    quantity: { $sum: '$products.quantity' },
                    amount: { $first: '$payment.amount' } // Extract the amount from the payment subdocument
                  }
                },
                {
                  $project: {
                    _id: 0,
                    month: '$_id.month',
                    year: '$_id.year',
                    orderIds: '$_id.orderId',
                    productNames: 1,
                    category: 1,
                    quantity: 1,
                    amount: 1
                  }
                }
              ]);
            }if(mode === 'Yearly'){
              console.log(targetYear)
          
          //const sales1 = await Orders.find(query)
         sales = await Orders.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date(targetYear, 0, 1),
                  $lt: new Date(targetYear + 1, 0, 1),
                },
                status: 'Delivered'
              }
            },
            {
              $unwind: '$products'
            },
            {
              $group: {
                _id: {
                  month: { $month: '$createdAt' },
                  year: { $year: '$createdAt' },
                  orderId: '$orderId'
                },
                productNames: { $push: '$products.p_name' },
                category: { $push: '$products.category' },
                quantity: { $sum: '$products.quantity' },
                amount: { $first: '$payment.amount' } // Extract the amount from the payment subdocument
              }
            },
            {
              $project: {
                _id: 0,
                month: '$_id.month',
                year: '$_id.year',
                orderIds: '$_id.orderId',
                productNames: 1,
                category: 1,
                quantity: 1,
                amount: 1
              }
            }
          ]);
            }
           
      // Generate the PDF
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('report.pdf'));

    // Add content to the PDF
    doc.fontSize(12).text('Report ', { align: 'center' });
    doc.text('--------------------------');

    
    sales.forEach((document) => {
      doc.text(`Product: ${document.productNames}`);
      doc.text(`Category: ${document.category}`);
      doc.text(`Quantity: ${document.quantity}`);
      doc.text(`Amount: ${document.amount}`);
      doc.text('--------------------------');
    });

   // Stream the PDF to the response
   const filename = 'report.pdf';
   res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
   res.setHeader('Content-Type', 'application/pdf');
   doc.pipe(res);
   doc.end();
    console.log('PDF report generated successfully.');

    }catch(err){
      console.log(err)
    }
}

module.exports = {
  loadRegister,
  registerAdmin,
  loadLogin,
  loginAdmin,
  loadHome,
  logout,
  loadUserData,
  blockedUser,
  loadAddCoupons,
  saveCoupons,
  loadCoupons,
  manageCoupon,
  loadWallets,
  report,
  download
};
