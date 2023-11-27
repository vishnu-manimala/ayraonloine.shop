const express = require("express");
const userRoutes = express();
const multer = require('multer');


userRoutes.set("view engine", "ejs");
userRoutes.set("views", "./views/userViews");

// const upload = multer({ dest: 'uploads/' });


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'productImages'); // Destination folder for uploaded images
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname); // Unique filename for each uploaded image
    }
  });
  
  const upload = multer({ storage: storage });

//middleware auth
const userAuth = require("../middleware/userAuth");

//controllers
const userController = require("../controller/userController");
const userProductsController = require('../controller/userProductsController');
const userProfileController = require('../controller/userProfileController');
const api = require('../api/apiModules');



//  ********************************  Routes  ********************************

//home rote
userRoutes.get("/",  userController.Loadhome);

//login page *****************  Login Routes  ***************

    //Login with otp
    userRoutes.get("/login", userAuth.inSession, userController.loadLogin);
    userRoutes.post("/login", userAuth.loginOTPAuth, userController.sendOTPLogin);
    userRoutes.post('/login/resend',userAuth.otp, userController.resendOtp);
  
    //Login with pswd
    userRoutes.get('/userlogin',userAuth.inSession,userController.loadPasswordLogin);
    userRoutes.post('/userlogin',userAuth.uservalidation,userController.userLoginPassword);


//register page  *****************  register Routes  ***************
userRoutes.get("/register", userAuth.inSession, userController.loadRegister);
userRoutes.post("/register", userAuth.sendOTPValidation, userController.sendOTP);
userRoutes.post('/register/resend',userAuth.otp,userController.resendRegesterOtp);


//forgot password *****************  forgot Routes  ***************
userRoutes.get('/forgotPassword',userAuth.inSession,userController.loadForgotPassword);
userRoutes.post('/forgotPassword',userAuth.loginOTPAuth,userController.sendOtpResetOtp);
userRoutes.post('/otpValidate',userController.otpvalidate);
userRoutes.post('/reset/resend',userController.resendreset);
userRoutes.post('/resetPassword',userController.resetPassword);


//product Route  *****************  product Routes  ***************
userRoutes.get('/product/:id',userProductsController.productView); //to view product 
userRoutes.post("/api/filter",userProductsController.loadFilter)
userRoutes.post("/home/page",userProductsController.loadFilterpagination)


//add to bag  *****************  add to bag Routes  ***************
userRoutes.post('/product/api/addtoBag',userAuth.isLoged,userAuth.isBlockedApi,userProductsController.addToBag);

//add to wishlist *****************  add to wishlist Routes  ***************
userRoutes.post('/product/api/addtoWishlist',userAuth.isLoged,userAuth.isBlockedApi,userProductsController.addToWishlist);


// cart   *****************  cart Routes  ***************
userRoutes.get('/kart',userAuth.isLogged,userAuth.isBlocked,userProductsController.loadKart); 
userRoutes.post('/kart/deleteKart',userAuth.isLogged,userAuth.isBlocked,userProductsController.deleteKart);


//checkout routes
userRoutes.get('/kart/checkout',userAuth.isLogged,userAuth.isBlocked,userProfileController.loadCheckout);
userRoutes.get('/checkout/success',userAuth.isLogged,userAuth.isBlocked,userProductsController.loadSuccess);
userRoutes.get('/kart/ckeckout/order',userAuth.isLogged,userAuth.isBlocked,userController.loadOrder);
userRoutes.post('/kart/ckeckout/order',userAuth.isLogged,userAuth.isBlocked,userController.cancelReturnOrder);

//load wishlist  
userRoutes.get('/wishlist',userAuth.isLogged,userAuth.isBlocked,userProductsController.loadWishlist); 
userRoutes.post('/api/delete',userAuth.isLogged,userAuth.isBlockedApi,userProductsController.deleteWishlist);

//invoice 
userRoutes.get('/invoice',userController.orderInvoice)

//profile route
userRoutes.get('/user_profile',userAuth.isLogged,userAuth.isBlocked, userProfileController.loadUserProfile);
userRoutes.get('/profile/address_manager',userAuth.isLogged,userAuth.isBlocked,userProfileController.loadAddressManager);
userRoutes.post('/profile/address_manager',userAuth.isLogged,userAuth.isBlocked,userProfileController.saveNewAddress);
userRoutes.get('/profile/pancard',userAuth.isLogged,userAuth.isBlocked, userProfileController.loadPancard);
userRoutes.get('/profile/orders',userAuth.isLogged,userAuth.isBlocked, userProfileController.loadOrders);
userRoutes.post('/profile/photoUpload',userAuth.isLogged,userAuth.isBlocked, upload.single('profileImage'),userProfileController.profileImageUpload)
userRoutes.get('/oreder/cancelled',userAuth.isLogged,userAuth.isBlocked, userProfileController.loadcancelmsg)

//api 
userRoutes.post('/api/update',userAuth.isLogged,userAuth.isBlockedApi,api.updateProfildata);
userRoutes.post('/api/updateAddress',userAuth.isLogged,userAuth.isBlockedApi,api.updateAddress);
userRoutes.post('/api/deleteAddress',userAuth.isLogged,userAuth.isBlockedApi,api.deleteAddress);
userRoutes.post('/api/saveOrder',userAuth.isLogged,userAuth.isBlockedApi,api.saveOrder);
userRoutes.post('/api/saveOrderUpi',userAuth.isLogged,userAuth.isBlockedApi,api.saveOrderUpi);
userRoutes.post('/api/updateQuantity',userAuth.isLogged,userAuth.isBlockedApi,api.updateQuantity);
userRoutes.post('/api/checkQuantity',userAuth.isLogged,userAuth.isBlockedApi,api.checkQuantity)
//logout
userRoutes.post("/logout", userAuth.logged, userController.logoutUser);







module.exports = userRoutes;
