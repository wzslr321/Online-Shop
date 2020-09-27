const mongoose = require("mongoose"),
      Schema   = mongoose.Schema,
      bcrypt   = require("bcrypt-nodejs");

const userSchema = new Schema({

    firstName: {
          type:String,
          required:true
    },

    secondName: {
          type:String,
          required:true
     },

    email: { 
         type:String,
         required:true
    },

    password:{
         type:String,
         required:true
    },

    date:{
         type:Date,
         default:Date.now
    },

    resetToken:String,
    resetTokenExpiration:Date,

    emailToken:String,
    emailTokenExpiration:Date,

    isVerified:Boolean,

    cart:{
        items:[
            {
                productId:{
                     type:Schema.Types.ObjectId,
                     ref:"Product",
                     required:true
                },

                quantity:{type:Number, required:true}
            }
        ]
    }, 

     shippingCart:[{

           country:{
                type:String,
                required:false
     },

           city:{
                type:String,
                required:false
     },

           zipCode:{
                type:String,
                required:false
    },
           street:{
                type:String,
                required:false
    },

    houseNumber:{

                type:String,
                required:false
    },
    
    payment:{
                type:String,
                required:false
    }


     }]

        
});

userSchema.methods.addToCart = function(product) {
    
    const cartProductIndex = this.cart.items.findIndex(cb => {

         return cb.productId.toString() === product._id.toString();

    });

    let newQuantity = 1;

    const updatedCartItems = [...this.cart.items];

    if(cartProductIndex >= 0) {

         newQuantity = this.cart.items[cartProductIndex].quantity +1;
         updatedCartItems[cartProductIndex].quantity = newQuantity;

    } else {

        updatedCartItems.push({

             productId: product._id,
             quantity:newQuantity

        });

     }
        
        const updatedCart = {

             items:updatedCartItems

        }

        this.cart = updatedCart;
        
           return this.save();
    }


userSchema.methods.removeFromCart = function(productId) {

    const updatedCartItems = this.cart.items.filter(item => {

         return item.productId.toString() !== productId.toString();

    });

    this.cart.items = updatedCartItems;

         return this.save();
}

userSchema.methods.hashPassword = password => {

    return bcrypt.hashSync(password, bcrypt.genSaltSync(12), null);
    
};

userSchema.methods.checkPassword = password => {

     return bcrypt.compareSync(password, this.local.password);
     
};

module.exports = mongoose.model("User", userSchema)