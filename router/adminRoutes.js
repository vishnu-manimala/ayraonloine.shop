const express = require("express");
const adminRoutes = express();
const fs = require('fs');
const path = require('path')
const multer = require('multer');

adminRoutes.set("view engine", "ejs");
adminRoutes.set("views", "./views/adminViews");

adminRoutes.use('/static',express.static(path.join(__dirname, '../public')));
adminRoutes.use(express.json());
adminRoutes.use(express.urlencoded({ extended: true }));

// middlewares
const adminAuth = require("../middleware/adminAuth");
const categoryAuth = require("../middleware/categoryAuth");
// const upload = require('../middleware/productAuth');

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

//admin controller
const adminController = require("../controller/adminController");

// Category Controller
const categoryController = require("../controller/categoryController");

//product Controller
const productController = require('../controller/productController');
const productModel = require('../Model/productModel');

//api

const api = require('../api/apiModules')


//admin Register Routes
adminRoutes.get("/register", adminAuth.sessionValidation, adminController.loadRegister);
adminRoutes.post("/register", adminAuth.verifyAdmin, adminController.registerAdmin);

//admin Login Routes
adminRoutes.get("/login", adminAuth.sessionValidation, adminController.loadLogin);
adminRoutes.post("/login", adminAuth.verifyLogin, adminController.loginAdmin);

//admin Logout Routes
adminRoutes.post("/logout", adminAuth.isLoggedIn, adminController.logout);

//admin Home Routes
adminRoutes.get("/home", adminAuth.isLoggedIn, adminController.loadHome); //adminAuth.adminValidations

//Users Routes
adminRoutes.get("/users",adminAuth.isLoggedIn, adminController.loadUserData); //adminAuth.isLoggedIn
adminRoutes.post("/users",adminAuth.isLoggedIn, adminController.blockedUser);

//Category Routes
adminRoutes.get("/category",adminAuth.isLoggedIn,categoryController.loadCategory);//adminAuth.isLoggedIn
//adminRoutes.post("/category",categoryController.addCategory);//adminAuth.isLoggedIn
adminRoutes.post('/category/unlist',adminAuth.isLoggedIn,categoryController.unlistCategory);//adminAuth.isLoggedIn
adminRoutes.get('/category/edit_category',adminAuth.isLoggedIn,categoryController.loadEeditCategory);//adminAuth.isLoggedIn
adminRoutes.post('/category/edit_category',adminAuth.isLoggedIn,categoryController.editCategory);//adminAuth.isLoggedIn
adminRoutes.get('/category/add_category',adminAuth.isLoggedIn,categoryController.loadAddCategory);//adminAuth.isLoggedIn
adminRoutes.post('/category/add_category',adminAuth.isLoggedIn,categoryController.addCategory);//adminAuth.isLoggedIn


//admin Products Routes
adminRoutes.get("/products", adminAuth.isLoggedIn, productController.loadProducts);
adminRoutes.post('/products/unlist',adminAuth.isLoggedIn,productController.listUnlist);
adminRoutes.get('/products/unlistedproducts',adminAuth.isLoggedIn,productController.loadUnlistedProducts)

    //add Products
    adminRoutes.get("/products/add_products",adminAuth.isLoggedIn,productController.loadAddProducts);
    adminRoutes.post("/products/add_products",adminAuth.isLoggedIn,upload.fields([
      { name: 'mainImage', maxCount: 1 },
      { name: 'image', maxCount: 5 }
    ]), productController.addproduct);//adminAuth.isLoggedIn,

    //editProducts
    adminRoutes.get('/products/edit_products',adminAuth.isLoggedIn,productController.loadEditProducts)
    adminRoutes.post('/products/edit_products',adminAuth.isLoggedIn,upload.array("image"),productController.updateProducts)
    adminRoutes.post('/products/edit_product/delete_image',adminAuth.isLoggedIn,productController.deleteImage)

    //orders list Routes
    adminRoutes.get('/orders',adminAuth.isLoggedIn,productController.loadOrders)
    adminRoutes.get('/orderview',adminAuth.isLoggedIn,productController.loadOrderview)
   

//Coupon manager Routes
adminRoutes.get("/addcoupons",adminAuth.isLoggedIn,  adminController.loadAddCoupons);
adminRoutes.post("/addcoupons", adminAuth.isLoggedIn, adminController.saveCoupons);
adminRoutes.get("/coupons", adminAuth.isLoggedIn, adminController.loadCoupons);
adminRoutes.post("/coupon/manage",adminAuth.isLoggedIn,  adminController.manageCoupon);

//api
adminRoutes.post('/api/setStatus',api.setStatus);
adminRoutes.post('/api/fetchSales',api.fetchSales);

//wallet
adminRoutes.get('/wallet',adminAuth.isLoggedIn,  adminController.loadWallets)

//reports
adminRoutes.post('/report',adminAuth.isLoggedIn,  adminController.report)
adminRoutes.post('/api/download',adminController.download);
adminRoutes.post('/paginate',productController.paginate);

module.exports = adminRoutes;
