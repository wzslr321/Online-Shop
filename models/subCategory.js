const mongoose = require("mongoose"),
      Schema   = mongoose.Schema;

const categorySchema = new Schema({ 

      name:{
             type:String,
      },

})

module.exports = mongoose.model("SubCategory",categorySchema)
