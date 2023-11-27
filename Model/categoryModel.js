const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    
  },
  isAvailable:{
    type:Boolean,
    required:true,
    default:true
  }
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
