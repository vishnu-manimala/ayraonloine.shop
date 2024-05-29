

const AuthToken =process.env.AuthToken;
const AccountSID = process.env.AccountSID;
const twilio = require("twilio")(AccountSID, AuthToken);


const { Redirect } = require("twilio/lib/twiml/VoiceResponse");
const User = require("../Model/userModel");
const bcrypt = require('bcrypt');
const { LocalStorage } = require('node-localstorage');

const Product = require('../Model/productModel');
const Category = require('../Model/categoryModel');
const { floor, ceil, constant } = require("lodash");
const Wallet = require('../Model/walletModel');
const Orders = require('../Model/orderModel');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const userModel = require("../Model/userModel");

//to generate OTP
function generateOTP() {
  const digits = "0123456789";
  let OTP = "";

  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}


//Send Otp Function
function sendOtp(number,otp){
  try{
   
      console.log(sendOtp);
      return sendOtp;
    }catch(err){
      console.log(err);
    }
}


//bcrypt
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};


                
      //LOad HOme
          const Loadhome = async (req, res) => {         
            // try {
              // if(req.session.userId){
              // const walletdata = await Wallet.find({userId:req.session.userId})
              // }
              // const userData = await User.findOne({ _id: req.session.userId });
              res.send(userData);
              // const category = await Category.find({isAvilable:false},{categoryName:1,_id:0});
            
              // const datas = await Product.find({isAvilable:true}).count();
              // const count = ceil(datas/6);
              // const data = await Product.find({isAvilable:true}).limit(6);
              // const categoryData = await Category.find({isAvailable: true});
              // if (userData) 
              // {
              //   res.render("home", { count:count, userdata: userData, data:data, categoryData,page:1 });
              // } 
              // else 
              // {
              //   res.render("home", {count:count, data: data, userdata:"",categoryData,page:1 });
              // }
            // } catch (err) {
            //   console.log("in load home",err.message);
            //   res.send("error");
             
            // }
          };
         
         
         
          const logoutUser = (req, res) => {
            try {
              req.session.userId = null;
              res.redirect("/");
            } catch (err) {
              console.log(err.message);
            }
          };
         


//Login with OTP
                //load login page
            const loadLogin = async (req, res) => {
              try {
                const userdata = "";
                res.render("loginUser", {userdata});
              } catch (err) {
                console.log(err.message);
                res.render("loginUser", { message: `${err.message}` });
              }
            };


            const sendOTPLogin = async (req, res) => {
              if(req.query.id === "success"){
                try {
                  const loggedUserData = await User.findOne({
                    phone: req.app.locals.loginContact,
                  });
                  console.log(loggedUserData);
                  if (loggedUserData ) {
                      req.session.userId = loggedUserData._id;
                      res.redirect("/");
                  } else {
                    res.render("loginUser", { message: "Login Failed" });
                  }
                } catch (err) {
                  console.log("loginUser :" + err.message);
                  res.render("loginUser", { message: `${err.message}` });
                }
              }else{

                try {
                  const loginKey = generateOTP();
                  console.log("userPhoneNumber :>> ", req.body.phoneNumber);
                  req.app.locals.OTP = loginKey;
                  req.app.locals.loginContact = req.body.phoneNumber;
                  req.session.contactNumber = req.body.phoneNumber;
                  // localStorage.setItem("contactNumber", req.body.phoneNumber)
                  console.log(req.app.locals.OTP);
                  console.log(req.app.locals.loginContact);
                  // res.render("loginOTP", { message: "OTP send succesfully",otp:"succes" });
                  //await twilio.calls
                  
                  await twilio.messages //sending message to number
                    .create({
                      body: loginKey,
                      to: `+91${req.body.phoneNumber}`, // Text your number
                      from: "+16185076078", // From a valid Twilio number
                    })
                    .then((message) => {
                      //console.log(message);
                      res.render("loginOTP", { message: "OTP send succesfully",otp:"succes" });
                    });
                } catch (err) {
                  console.log(err);
                  res.render("loginUser", { message: `${err.message}` });
                }
                setTimeout(() => {
                  req.app.locals.OTP = "";
                }, 60000);

              }
              
            };


             //resend Otp for login           
            const resendOtp = async (req, res)=>{
              try{
                const num = req.session.contactNumber;
                console.log("in resend controller");
                const otp =  generateOTP();
                console.log("resend : "+otp);
                const resend = await twilio.messages //sending message to number
                .create({
                  body: otp,
                  to: `+91${num}`, // Text your number
                  from: "+1 6185076078", // From a valid Twilio number
                })
                .then((message) => {
                  console.log(req.app.locals.OTP=otp);
                  req.app.locals.OTP=otp;
                  console.log(req.app.locals.OTP=otp);
                  res.render("loginOTP", { message: "OTP resend succesfully",otp:"succes" });
                  localStorage.setItem("contactNumber", "")
                });
                
                
              }catch(err){
                console.log("resend : "+err);
              }
              setTimeout(() => {
                req.app.locals.OTP = "";
              }, 60000);
            };


// Login with Password

      const loadPasswordLogin = (req, res) => {
        try {

          res.status(200);
          res.render("userLogin");
        } catch (err) {
          console.log("in load passwordlogin",err.message);
          res.render("loginUser", { message: `${err.message}` });
        }
      };


      const userLoginPassword = async (req, res) => {
        try {
          const data = req.app.locals.data;
          if (data) {
            const matchPassword = await bcrypt.compare(
              req.body.password,
              data.password
            );
            if (matchPassword) {
              req.session.userId = data._id;
              res.status(200);
             
              res.redirect("/");
            } else {
              const message = "password incorect";
              res.render("loginUser", { message:message })
            }
          }
        } catch (err) {
          console.log('userLoginPassword',err.message);
        }
      };


//Register
          //Load register page
          const loadRegister = async (req, res) => {
            try {
              res.render("registerUser");
            } catch (err) {
              console.log(err.message);
            }
          };

          //To send OTP
          const sendOTP = async (req, res) => {

            if(req.query.id === "success"){
              try {
                console.log( req.app.locals.password);
            
                const sPassword = await securePassword( req.app.locals.password);
                console.log(sPassword);

                //user initializing
                const user = new User({
                  name: req.app.locals.name,
                  email: req.app.locals.email,
                  phone: req.app.locals.phone,
                  password: sPassword,
                });
                console.log(user);
            
                //save user
                const userData = await user.save();

                //retrieving userdata to get user_id
               // const newUserData = await User.find({phone:req.app.locals.phone});
               console.log("userData :>> ", userData);
               console.log("userData.id :>> ", userData._id);
                //wallet initialization
                const walletInit = new Wallet({
                  userId:userData._id,
                  username:userData.name,
                  cash:'50'
                })
                //save wallet
                await walletInit.save();

                
                if (userData) {
                  res.render("loginUser", {
                    message: "succesfully registered. Login Now!!",
                  });
                  req.app.locals.name = "";
                  req.app.locals.email = "";
                  req.app.locals.phone = "";
                } else {
                  res.render("registerUser", { message: "Registration failed" });
                  console.log(err.message);
                }
              } catch (err) {
                console.log(err);
              }
            }else{
              try {
                const randomKey = generateOTP();
                console.log("userPhoneNumber :>> ", req.body.userPhoneNumber);
                
                req.app.locals.OTP = randomKey;
                req.app.locals.name = req.body.userName;
                req.app.locals.email = req.body.userEmail;
                req.app.locals.phone = req.body.userPhoneNumber;
                req.app.locals.password = req.body.password;
                console.log(req.app.locals.OTP);
               // res.render("registerOTP", { message: "OTP send succesfully" });
                await twilio.messages //sending message to number
                  .create({
                    body: randomKey,
                    to: `+91${req.body.userPhoneNumber}`, // Text your number
                    from: "+1 6185076078", // From a valid Twilio number
                  })
                  .then((message) => {
                    //console.log(message);
  
                    res.render("registerOTP", { message: "OTP send succesfully" });
                  });
              } catch (err) {
                console.log(err.message);
                res.render("registerUser", { message: err.message });
              }
              setTimeout(() => {
                req.app.locals.OTP = "";
              }, 60000);
            }
          
          };

          //resend otp for reg

          const resendRegesterOtp = async (req,res)=>{
            try{
            //const num = localStorage.getItem('contactNumber')
              // console.log("in resend controller");
              const otp =  generateOTP();
              console.log("resend : "+otp);
              console.log("phone : "+req.app.locals.phone);
              const resend = await twilio.messages //sending message to number
              .create({
                body: otp,
                to: `+91${req.app.locals.phone}`, // Text your number
                from: "+1 6185076078", // From a valid Twilio number
              })
              .then((message) => {
                console.log(req.app.locals.OTP=otp);
                req.app.locals.OTP=otp;
                console.log(req.app.locals.OTP=otp);
                res.render("registerOTP", { message: "OTP resend succesfully",otp:"succes" });
                localStorage.setItem("contactNumber", "")
              });
              
              
            }catch(err){
              console.log("resend : "+err);
            }
            setTimeout(() => {
              req.app.locals.OTP = "";
            }, 60000);
          };




//Forgot Password

          //load forgot passowrd
          const loadForgotPassword = (req,res)=>{
            try{
              res.status(200)
              res.render('forgotPassword');
            }catch(err){
              console.log("in load forgot password controller : "+err.message)
            }
          };

          //send otp to reset
        const sendOtpResetOtp = async(req, res)=>{
          try{
            req.app.locals.loginContact = req.body.phoneNumber;
            const otp =  generateOTP();
            console.log("otp : "+otp);
            console.log("phone : "+req.app.locals.phone);
            const send = await twilio.messages //sending message to number
            .create({
              body: otp,
              to: `+91${req.app.locals.loginContact}`, // Text your number
              from: "+1 6185076078", // From a valid Twilio number
            })
            .then((message) => {
            
              req.app.locals.OTP=otp;
              console.log(req.app.locals.OTP);
              req.app.locals.code = "otp";
              res.render("otpForgot", { message: "OTP send succesfully" });
              // localStorage.setItem("contactNumber", "")
            });
          }catch(err){
              console.log("send otp for forgot password : "+err.message);
          }
      };

      //otp validation
        const otpvalidate = (req,res)=>{
          try{
            const resetOtp = req.body.otp;
            if(req.app.locals.OTP === ""){
              req.app.locals.code = "otp";
              res.render("otpForgot",{message:"OTP expired"});
            }
            else if(resetOtp === req.app.locals.OTP ){
              
              res.render("resetPassword");
            }else{
              res.render("forgotPassword",{message:'something went wrong!'});
            }
          }catch(err){
            console.log(err);
          }
        
        }

        //resend reset password otp
        const resendreset = async (req,res)=>{
          try{
            //const num = localStorage.getItem('contactNumber')
              // console.log("in resend controller");
              const otp =  generateOTP();
              console.log("resend : "+otp);
              console.log("phone : "+ req.app.locals.loginContact);
              const resend = await twilio.messages //sending message to number
              .create({
                body: otp,
                to: `+91${ req.app.locals.loginContact}`, // Text your number
                from: "+1 6185076078", // From a valid Twilio number
              })
              .then((message) => {
                console.log(req.app.locals.OTP);
                req.app.locals.OTP=otp;
                console.log(req.app.locals.OTP);
                res.render("otpForgot", { message: "OTP resend succesfully",otp:"succes" });
                localStorage.setItem("contactNumber", "")
              });
          }catch(err){
            console.log("resend : "+err);
          }
          setTimeout(() => {
            req.app.locals.OTP = "";
          }, 60000);
      }

      //reset password
      const resetPassword = async (req,res)=>{
        try{
          const loginConact = req.app.locals.loginContact;
          const newPassword= req.body.password;
              const sPassword = await securePassword(newPassword );
              await User.updateOne({phone:loginConact},{password:sPassword})
            .then((message)=>{
              res.redirect("/user/login");
            })   
        }catch(err){

        }
      };

      const loadOrder = async(req,res)=>{
        try{
            const userId = req.session.userId;
            const orderId = req.query.id;
            console.log("orderId >> ", orderId)
            const orderData= await Orders.findById(orderId);
            const addresId = orderData.address;
            const userData = await User.findOne({_id: userId})
            const addressData = userData.address.items;
            const address = addressData.find((data) => data._id.toString() === addresId.toString());
            console.log("address",address)
            const addresString = address.HouseNum+" ,"+address.address+" ,"+address.city+" ,"+address.state+" ,"+address.pincode
           
            console.log("orderData >> ", orderData)
            res.render('productManager/orderview',{userdata:"hii",orderData,addresString,address,orderId,page:1})
        }catch(err){
            console.log("loadOrder >> ", err.message)
        }   
    }


    
const cancelReturnOrder = async (req,res)=>{
  try{
      const body = req.body;
      const id = body.id;
   
      console.log("cancelReturnOrder >> ",body);
      const orderData = await Orders.findById(id,{products:1,_id:0});
      console.log("cancelReturnOrder: order >> ",orderData);
      let productIds = new Array(); 
      orderData.products.forEach(element => {
              productIds.push(element.id);
          });
          
          console.log("cancelReturnOrder: productIds >> ",productIds);
     const ProductData = await Product.find({_id:{$in:productIds}})
     console.log("cancelReturnOrder: ProductData >> ",ProductData);
     
 
      //checking status to update
      if(body.status === "return"){
          update = {$set:{status:"return requested",orderCancelReason:body.selectedValue, orderReturnRequest:true}}
         
         
      }else if(body.status === "cancel"){
          update={$set:{status:body.status,orderReturnReason:body.selectedValue,orderCancleRequest:true}}
      }

   
      if(body.selectedValue !== "product defect"){
          productIds.forEach(async (data)=>{
                      const product = ProductData.find(element=>element._id.toString() === data.toString())
                      const orderedProduct = orderData.products.find(element=>element.id.toString() === data.toString())
                      console.log("product>> ",product)
                      console.log("orderedProduct>> ",orderedProduct)
                      const updateQuantity = parseInt(product.quantity) +parseInt(orderedProduct.quantity);
                      console.log("updateQuantity>> ",updateQuantity)
                      product.quantity = updateQuantity;
                      const update = await Product.findByIdAndUpdate(data,{$set:{quantity:updateQuantity}})
                      console.log("update>> ",update)
                     })
      }
      const updateStatus = await Orders.findByIdAndUpdate(id,update);
      console.log("updateStatus>> ",updateStatus)
      if(updateStatus){
          res.json("done");
      }else{
          res.json("wrong");
      }
      

  }catch(err){
      console.log("in cancel or return >> ",err.message);
      res.json("something went wrong");
  }
  
}
    
const orderInvoice = async (req,res)=>{
const id=req.query.id;
try{
  //find order details
  const orderData = await Orders.findById(id);
console.log("orderData >>",orderData)
  //find address
  const userData =  await User.findById(orderData.userId)
  console.log("userData >>",userData)
  const addres = userData.address.items.find(data=> data.id.toString() === orderData.address.toString())
  console.log(addres)
   // Generate the PDF
   const doc = new PDFDocument();
   doc.pipe(fs.createWriteStream('invoice.pdf'));

   // Add content to the PDF
   
   doc.fontSize(15).text('Ayra ', { align: 'center' });
   doc.fontSize(12).text('Invoice ', { align: 'center' });
   doc.text('--------------------------');

   doc.text(`Order Id: ${orderData.orderId}`);
   doc.text(`Order Date: ${orderData.createdAt}`);
   doc.text('--------------------------');

   doc.text(`Name: ${addres.name}`);
   doc.text(`Phone: ${addres.phone}`);
   doc.text(`Deleivery Address: ${addres.phone}`);

   orderData.products.forEach((document) => {
    doc.text(`Product: ${document.p_name}`);
   
    doc.text(`Quantity: ${document.quantity}`);
    doc.text(`Amount: ${document.price}`);
    doc.text('--------------------------\n');


    doc.text(`Total Amount : ${orderData.payment.actualAmount}`);
   doc.text(`Payable Amount: ${orderData.payment.amount}`);
   doc.text('--------------------------');
  });

 // Stream the PDF to the response
 const filename = 'Invoice.pdf';
 res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
 res.setHeader('Content-Type', 'application/pdf');
 doc.pipe(res);
 doc.end();


}catch(err){
  console.log("in invoice >> ", err.message)
}
  
}




module.exports = {
  loadRegister,
  loadLogin,
  sendOTP,
  sendOTPLogin,
  Loadhome,
  logoutUser,
  loadPasswordLogin,
  userLoginPassword,
  resendOtp,
  resendRegesterOtp,
  loadForgotPassword,
  sendOtpResetOtp,
  resetPassword,
  otpvalidate,
  resendreset,
  loadOrder,
  cancelReturnOrder,
  orderInvoice
};
