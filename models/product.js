const mongoose = require("mongoose"),
      Schema   = mongoose.Schema;

const productSchema = new Schema({

    title:{
         type:String,
         required:true
    },

    price:{
         type:Number,
         required:true
    },

    category:{
           type:String,
           required:true
    },

    subCategory:{
           type:String,
           required:true
    },

    description:{
         type:String,
         required:true
    },

    descriptionExtended:{
          type:String,
          required:true
    },

    imageUrl: {
         type:String,
         required:true
    },

    userId:{
         type:Schema.Types.ObjectId,
         ref:"User",
         required:true
    }
    
});

module.exports = mongoose.model("Product", productSchema);