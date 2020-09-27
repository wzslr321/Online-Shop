const User               = require("../models/user"),
      noAuthUser         = require("../models/no-auth-user"),
      config             = require("../config/passport"),
      Order              = require('../models/order'),
      bcrypt             = require("bcryptjs"),
      nodemailer         = require("nodemailer"),
      crypto             = require("crypto"),
      shopController     = require("../controllers/shop"),
      Product            = require("../models/product"),
      sendGridTrasnsport = require("nodemailer-sendgrid-transport");

      require("dotenv").config({path:".env"})

const transporter        = nodemailer.createTransport(sendGridTrasnsport({

         auth:{

           api_key:process.env.API_KEY

         }

}));


/* ======================================== */

exports.getLoginForm = (req,res,next) => {

    res.render("authentication/login", {

         title:"Zaloguj się",
         isAuthenticated:false,
         message:req.flash("loginMessage")

    });
}

/* ======================================== */

exports.getRegisterForm = (req,res,next) => {

    res.render("authentication/register", {

         title:"Zajerejstruj się",
         message:req.flash("registerMessage")
 
    });
}

/* ======================================== */

exports.postRegisterForm =  (req, res,next) => {

    const { email, password, confirmPassword,firstName, secondName } = req.body,
            pattern =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    let errors = [];

    if(!email.match(pattern)){
       errors.push({message: "Proszę wprowadzić prawidłowy adres e-mail"})
    }
  
    if (!email || !password || !confirmPassword || !firstName || !secondName) {
       errors.push({ message: 'Prosze uzupełnić wszystkie pola' });
    }
  
    if (password != confirmPassword) {
       errors.push({ message: 'Hasła do siebie nie pasują' });
    }
  
    if (password.length < 8) {
       errors.push({ message: 'Hasło musi mieć przynajmniej 8 znaków' });
    }
  
    if (errors.length > 0) {

      res.render('authentication/register', {

         errors,
         email,
         password,
         title:"Zajerejstruj się",
         confirmPassword

      });

    } else {

      User.findOne({ email: email }).then(user => {

        if (user) {
        
           errors.push({ message : 'Użykownik z podanym adresem e-mail już istnieje' });

           res.render('authentication/register', {

             errors,
             email,
             title:"Zajerejstruj się",
             password,
             confirmPassword,

          });

        } else {

          var isVerified = User.isVerified,
              isVerified = false;
          
          const newUser = new User({

             email,
             password,
             isVerified:isVerified,
             firstName,
             secondName

          });
  
          bcrypt.genSalt(12, (err, salt) => {

            bcrypt.hash(newUser.password, salt, (err, hash) => {

              if (err) throw err;

               newUser.password = hash;
               newUser.save()

                   .then( ()   => { 
                    
                    crypto.randomBytes(32, (error,buffer) => {

                      if(error) {

                           return res.redirect("/rejerstracja");

                      }
                  
                       const emailToken = buffer.toString("hex")
                  
                      User.findOne({email:req.body.email})
                  
                           .then(user => {
                  
                           user.emailToken           = emailToken;
                           user.emailTokenExpiration = Date.now() + 3600000
                  
                           return user.save()
                  
                         })
                  
                           .then( () => {

                            if(!error){ 
                  
                               res.render("authentication/login", {

                                   message:"Wysłaliśmy e-mail weryfikacyjny na twoją pocztę",
                                   title:"Zaloguj się!"

                               })
                  
                               transporter.sendMail({
                  
                                   to     :req.body.email,
                                   from   :"wzslr321@op.pl",
                                   subject:"Weryfikacja konta",
                                   html   : `
                                   <h3> Drogi użytkowniku strony (...) </h3>
                                   <h5> Zweryfikuj swoje konto, żeby móc się zalogować! </h5>
                                   <p> Poniższy link jest aktywny tylko przez godzinę! </p>
                                   <p> <a href = "http://localhost:3000/weryfikacja/${emailToken}"> W celu zweryfikowania kliknij tutaj ! </a> </p>
                                   `
                  
                               });
                              }
                           })

                        
                  
                           .catch(err => {       
                  
                             const error = new Error(err);
                                  error.httpStatusCode = 500;
                  
                             return next(error);

                           });
                  
                       })
                    
                   })

                   .catch(err => {   

                     const error = new Error(err);
                          error.httpStatusCode = 500;
        
                     return next(error);
            });
            });
          });
        }
      });
    }
  };

/* ======================================== */

exports.getVerified = (req,res,next) => { 

     User.findOne({emailToken:req.params.emailToken})

           .then( (user) => { 
            
                 user.isVerified = true;
                 user.save()
                 console.log(user)

              })

           .catch(err => {

                const error = new Error(err);
                      error.httpStatusCode = 500;

                 return next(error);

           })

     res.render("authentication/login", {

         title:"Zaloguj się!",
         message:""

     })
}

/* ======================================== */           

exports.Logout = (req,res,next) => {

    req.session.destroy( () => {

         res.redirect("/")

    });
}

/* ===== RESETING PASSWORD ====== */

exports.getReset = (req,res,next) => {

     res.render("authentication/reset", {

       title:"Zresetuj hasło",

     });
}

exports.postReset = (req,res,next) => {

  crypto.randomBytes(32, (error,buffer) => {

    if(error) {

         return res.redirect("/reset");

    }

     const token = buffer.toString("hex")

    User.findOne({email:req.body.email})

         .then(user => {

            if(!user) {

               req.flash("error", "Nie ma takiego konta")
               return res.redirect("/reset")

            }

         user.resetToken = token;
         user.resetTokenExpiration = Date.now() + 3600000

         return user.save()

       })

         .then( () => {

             transporter.sendMail({

                 to     :req.body.email,
                 from   :"wzslr321@op.pl",
                 subject:"Zmiana hasła",
                 html   : `
                 <h4> Drogi użytkowniku strony (...) <h4>
                 <p> Aby zresetować hasło, kliknij w poniższy link, który jest ważny tylko przez godzinę! </p>
                 <p> <a href = "http://localhost:3000/reset/${token}"> Aby  zresetowac haslo kliknij tutaj ! </a> </p>`

             })
            
             .then( () => {

                 res.redirect("/logowanie")
                 
             })
    
  

         })

         .catch(err => {       

           const error = new Error(err);
                error.httpStatusCode = 500;

           return next(error);
  });

  })
}

exports.getShipVerification = (req,res,next) => {


     res.render("authentication/ship-verification", {

         title:"Weryfikacja do wysyłki",
         name:req.user.firstName,
         ndName:req.user.secondName,
         isAuthenticated:req.user,
         noAuth:false,
         errors:undefined

     })

}


exports.postShipVerification = (req,res,next) => {

  let errors = [];

     if(req.user) { 

      User.findOne({email:req.user.email})

      .then(user => {

      const country     = req.body.country,
            city        = req.body.city,
            zipCode     = req.body.zipCode,
            street      = req.body.street,
            houseNumber = req.body.houseNumber,
            payment     = req.body.paymentMethods                                                                   

      user.shippingCart = [{
            country,
            city,
            zipCode,
            street,
            houseNumber,
            payment
      }]

      if(!country || !city || !zipCode || !street || !houseNumber || !payment){

           errors.push("Uzupełnij wszystkie dane")
           
           res.render("authentication/ship-verification", {

            title:"Weryfikacja do wysyłki",
            name:req.user.firstName,
            ndName:req.user.secondName,
            isAuthenticated:req.user,
            noAuth:false,
            errors:errors
   
        })

      } else {
        user.save()

        .then( () => {

             errors = [];

             if(payment.toString() === "przelew"){

                 res.redirect("/sprawdzenie-platnosci")

             } else {

              req.user.populate("cart.items.productId")

              .execPopulate()
     
              .then( user => {

              
                  const products = user.cart.items.map(i => { 

                     Product.findById(i.productId)

                       .then( prod => {

                          prod.price += 10

                       })
     
                      return {
     
                          quantity:i.quantity,
                          product: {...i.productId._doc}
     
                      }
     
                  });

     
                 const order = new Order({
     
                     user: {
     
                          email :req.user.email,
                          userId:req.user
     
                     },
     
                     products: products,
     
                     isRealised:false,
                     isSent: false
     
                 });
     
                 order.save();


                 const email        = req.user.email,
                       firstName    = req.user.firstName,
                       secondName   = req.user.secondName,
                       User         = req.user,
                       shippingCart = req.user.shippingCart;
       
            Order.find({"user.email" : email})

                .then( order => {
       
                   let products
       
                   for( i = 0; i < order.length; i++) {
                        
                        products = order[i].products
       
                   }
       
                   res.redirect("/konto")
            
                })    
       
                .catch(err => {           
               
                   const error                = new Error(err);
                         error.httpStatusCode = 500;
           
                    return next(error);
       
                });

             })

             .catch(err => {  

              const error = new Error(err);
                  error.httpStatusCode = 500;
          
              return next(error);
          
          });

             }

          
        })
      
        .catch(err => {  

          const error = new Error(err);
              error.httpStatusCode = 500;
      
          return next(error);
      
      });

      }

     

 })

.catch(err => {  

    const error = new Error(err);
        error.httpStatusCode = 500;

    return next(error);

});

     } 
     
}

exports.getNewPassword = (req,res,next) => {

  const token = req.params.token;

  User.findOne({resetToken : token, resetTokenExpiration:{$gt:Date.now()}})

       .then(user => {

             res.render("authentication/new-password", {

               title        :"Ustaw nowe hasło",
               path         :"new-password",
               userId       : user._id.toString(),
               passwordToken:token

       })
     })

     .catch(err => {  

       const error = new Error(err);
             error.httpStatusCode = 500;

       return next(error);

});
  
}

exports.postNewPassword = (req,res,next) => {

  const newPassword   = req.body.password,
        userId        = req.body.userId,
        passwordToken = req.body.passwordToken;

  let resetUser;

  User.findOne({resetToken:passwordToken, resetTokenExpiration:{$gt:Date.now()}, _id:userId})

       .then( user => {

           resetUser = user;

           return bcrypt.hash(newPassword,12)
     })

       .then(hashedPassword => {

           resetUser.password             = hashedPassword;
           resetUser.resetToken           = null;
           resetUser.resetTokenExpiration = undefined;

           return resetUser.save()
     })

       .then( ()     => res.redirect("/logowanie") )

       .catch(err => {     

        const error = new Error(err);
              error.httpStatusCode = 500;

       return next(error);

});
}