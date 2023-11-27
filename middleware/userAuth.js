const User = require("../Model/userModel");
  
const sendOTPValidation = async (req, res, next) => {

  if(req.query.id === "success"){
    if (req.app.locals.OTP == "") {
      req.app.locals.code = "expired";
      res.render("registerOTP", { message: "Otp Expired" });
    } else if (req.app.locals.OTP == req.body.otp) {
      req.app.locals.code = "succes";
      next();
    } else {
      req.app.locals.code = "error";
      res.render("registerOTP", { message: "Otp Expired" });
    }
  }else{
    const email = req.body.userEmail;
    console.log(email);
    const userData = await User.findOne({
      $or: [{ email: email }, { phone: req.body.userPhoneNumber }],
    });
    console.log(userData);
    if (userData) {
      res.render("registerUser", { message: "user already exist!!!" });
    } else {
      next();
    }
  }
 
};



const loginOTPAuth = async (req, res, next) => {
 if(req.query.id ==="success"){
      try {
        if (req.app.locals.OTP == "") {
          req.app.locals.code = "expired";
          res.render("loginOTP", { message: "Otp Expired" });
        } else if (req.app.locals.OTP == req.body.otp) {
          req.app.locals.code = "succes";
          next();
        } else {
          console.log(req.body.otp, req.app.locals.OTP);
          req.app.locals.code = "error";
          res.render("loginOTP", { message: "Enter a valid OTP" });
        }
      } catch (err) {
        console.log(err.message);
      }

 }else{

      const userPhone = req.body.phoneNumber;
      console.log("phoneNumber :>> ", req.body.phoneNumber);
      const user = await User.findOne({ phone: userPhone });
      // console.log(userContactNumber);
      if (user) {
        if (user.isBlocked) {
          res.render("loginUser", { message: "You are Blocked!!!" });
        } else {
          next();
        }
      } else {
        res.render("registerUser", { message: "Register Now " });
      }
    }
  
};


const inSession = (req, res, next) => {
  if (req.session.userId) {
    res.redirect("/");
  } else {
    next();
  }
};

const isLogged = (req, res, next) => {
  try {
    console.log("in auth+");
    if (req.session.userId) {
      next();
    } else {
    
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message);
  }
};

const logged = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
};

const uservalidation = async (req,res,next)=>{

  try {
    console.log(req.body.password);
    const userData = await User.findOne({ email: req.body.email });
    if (userData) {
      if (userData.isBlocked) {
        req.session.userId='';
        const message = "You are Blocked!!!";
        res.render("loginUser",{message});
      } else {
        req.app.locals.data = userData;
        next();
      }
    } else {
      const message = "Email not registered";

      res.render("loginUser",{message});
    }
  } catch (err) {
    console.log("in uservalidation Auth",err);
  }
};

const otp = (req, res, next) => {
  console.log("in resend auth");
  if (req.app.locals.OTP) {
    req.app.locals.OTP = "";
    next();
  } else {
    next();
  }
};

const isBlocked = async (req,res,next)=>{

  const id = req.session.userId;
  const userData = await User.findOne({_id:id});
  if(userData.isBlocked){
    req.session.userId='';
    res.render('loginUser',{message: "You're Blocked!!!"})
   // res.redirect('/')
  } else{
    next();
  }

};

const isLoged = async (req,res,next)=>{

  if(req.session.userId){
    next()
  }else{
    res.send(JSON.stringify("login"))
  }

};

const isBlockedApi = async (req,res,next)=>{

  const id = req.session.userId;
  const userData = await User.findOne({_id:id});
  if(userData.isBlocked){
    req.session.userId='';
    // res.render('loginUser',{message: "You're Blocked!!!"})
    res.json('blocked')
  } else{
    next();
  }

};

// const resetAuth = (req,res,next)=>{
//   try{
//     req.app.locals.phone
//   }catch(err){

//   }
// }


module.exports = {
  sendOTPValidation,
 
  loginOTPAuth,
  inSession,
  isLogged,
  logged,
  uservalidation,
  otp,
  isBlocked,
  isBlockedApi,
  isLoged
  // resetAuth
};
