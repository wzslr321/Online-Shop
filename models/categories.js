const mongoose = require("mongoose"),
      Schema   = mongoose.Schema;

const categorySchema = new Schema({ 

      name:{
             type:String,
      },

      subcategory:{
             type:String
      }

})

module.exports = mongoose.model("category",categorySchema)
