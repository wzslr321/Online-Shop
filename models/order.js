const mongoose = require("mongoose"),
      Schema   = mongoose.Schema;

const orderSchema = new Schema({
    
    products:[

        {
             product:{type:Object},
             quantity:{type:Number}
        }

    ],
    
    user:{ 

        email:{
             type:String,
        },

        userId:{
             type:Schema.Types.ObjectId,
             ref:"User"
        },
        
     },
    
    isRealised:{
         type:Boolean,
    },

    isSent:{
         type:Boolean
    }
    
});

module.exports = mongoose.model("Order", orderSchema);