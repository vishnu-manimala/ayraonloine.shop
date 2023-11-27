const Admin = require('../Model/adminModel');
const bcrypt = require("bcrypt");

const verifyAdmin = async (req,res, next) =>{
    const userData = await Admin.findOne({$or:[{email:req.body.email},{phone:req.body.mobile}]});
    if(userData){
        res.render('adminRegister',{message:"admin already exists!!!"});
    }
    else{
        next();
    }
};

const verifyLogin = async (req,res,next)=>{
    try{
        const userData =await  Admin.findOne({email:req.body.email});
        if(userData){
            const matchPassword = await bcrypt.compare(req.body.password, userData.password);
            if(matchPassword){
               next();
            }
            else{
                res.render('loginAdmin',{message:"password incorect"});
            }
        } else{
            res.render('loginAdmin',{message:'username doesnot exist'});
        }
    }catch(err){
        console.log(err.message);
    }
};

const adminValidation =  (req,res,next)=>{
    try{
        if(req.session.admin_id){
            next();
        }else{
            res.redirect('/admin/login');
        }
    }catch(err){
        console.log(err.msg);
    }  
};

const sessionValidation = (req,res,next)=>{
    console.log(req.session.admin_id);
    if(req.session.admin_id){
        res.redirect('/admin/home');
    }else{
        next();
    }
};

const isLoggedIn = (req,res,next)=>{
    if(req.session.admin_id){
        next();
    }else{
        res.redirect('/admin/login');
    }
}
module.exports = {verifyAdmin, verifyLogin, adminValidation, sessionValidation,isLoggedIn};