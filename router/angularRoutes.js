const express = require("express");
const angularRoutes = express();

angularRoutes.get('/register',(req,res)=>{
    (req,res)=>{
        const data = {
            id:0,
            name:"vishnu"
        }
        try{
            console.log("vannu")
        res.status(200).json(data);
        }catch(err){
            console.log(err);
            res.status(400).send("error");
        }
        
    }
})

module.exports = angularRoutes;