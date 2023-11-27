// const multer = require('multer');



//     const Storage = multer.diskStorage({
//         destination:(req,file,cb)=>{
//             cb(null,'../public/product_images');
//         },
//         filename:  (req, file, cb)=> {
//             console.log(file)
//           cb(null, Date.now() + '-' + file.originalname); // Unique filename for the uploaded file
//         },
//     })

//     const upload = multer({ storage: storage });