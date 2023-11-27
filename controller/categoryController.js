const Category = require("../Model/categoryModel");

const loadCategory = async (req, res) => {
  try {
    const categoryData = await Category.find({});

    res.status(200);
    res.render("category", { data: categoryData });
  } catch (err) {
    console.log("loadCategory_Controller: " + err.message);
  }
};

const loadAddCategory = async (req, res) => {
  try {
   
   
    res.status(200);
    res.render("add_category",{message:""});
  } catch (err) {
    console.log("loadAddCategory_Controller: " + err.message);
  }
};

const addCategory = async (req, res) => {
  try {
    const categoryData = await Category.find({});
    const pattern = categoryData.map(data => data.categoryName).join('|');
        const regex = new RegExp(pattern,'i');
        const input = req.body.category_name;
        if(regex.test(input)){
          res.render('add_category',{message:"category already exist"})
        }else{
          const category = new Category({
            categoryName: req.body.category_name,
          });
          console.log("false");
          const addcat = await category.save();
          console.log(addcat);
          res.status(200);
          res.redirect("/admin/category");
        }
  } catch (err) {
    console.log("addcategoryController : " + err.message);
  }
};

const unlistCategory = async (req,res)=>{
    try{
        const id = req.query.id;
        const unlistCat = await Category.findOne({_id:id},{isAvailable:1});
        console.log(unlistCat.isAvailable)
        if(unlistCat.isAvailable){
            console.log("in true")
            await Category.updateOne({_id:id},{$set:{isAvailable:false}})
            res.status(200);
            res.redirect('/admin/category');
        } else{
            console.log("false")
            await Category.updateOne({_id:id},{$set:{isAvailable:true}})
            res.status(200);
            res.redirect('/admin/category');
        }
    }catch(err){
        console.log('in unlistController : '+err.msg);
    }
};
const loadEeditCategory = async (req,res)=>{
    try{
        const id = req.query.id;
        console.log(id);
        const edit = await Category.findOne({_id:id});
        console.log(edit);
        res.status(200);
        res.render('edit_category',{data:edit});
    }catch(err){
        console.log('in editaCategoryController : '+err.message);
    }
}

const editCategory = async (req, res)=>{
    try{
        const id = req.query.id;
        const name=req.body.category_edit;
       
        
        console.log('edit :>> ', req.query.id);
        const edit = await Category.updateOne({_id:id},{$set:{categoryName:name}});
        res.status(200);
        res.redirect('/admin/category');
    }catch(err){
        console.log('in editaCategoryController : '+err.message);
    }
};

module.exports = { loadCategory, loadAddCategory, addCategory, unlistCategory, editCategory,  loadEeditCategory};
