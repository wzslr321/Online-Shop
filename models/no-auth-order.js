
const mongoose = require("mongoose"),
Schema   = mongoose.Schema;

const orderSchema = new Schema({

noAuthUserId:{
        
    type:String

},

productNoAuth:{
   type:String
},

isRealised:{
    type:Boolean
},

isSent:{
    type:Boolean
}

});

module.exports = mongoose.model("OrderNoAuth", orderSchema);