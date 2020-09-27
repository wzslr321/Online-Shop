const mongoose = require("mongoose"),
      Schema   = mongoose.Schema;

const noAuthUser = new Schema({
    

        country:{
             type:String,
             required:true
        },

        email:{
             type:String,
             required:true
        },

        city:{
             type:String,
             required:true
         },

        zipCode:{
             type:String,
             required:true
        },

        street:{
             type:String,
             required:true
         },

         houseNumber:{

             type:String,
             required:true
         },
         productId:{
              type:String,
              required:true
         },
         name:{
              type:String,
              required:true
         },
         ndName:{
              type:String,
              required:true
         }




});

module.exports = mongoose.model("noAuthUser", noAuthUser);