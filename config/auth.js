const User = require("../models/user"),
      Category    = require("../models/categories");

let userId = "";

module.exports = {

    isAuthorized : (req,res,next) => {

         if ( req.isAuthenticated()) {
             return next();
         } 


         res.redirect("/logowanie")  
         req.flash("errorMsg", " Nie posiadasz uprawnień do przeglądania tej strony")  
            
    },

    sendAuthentication : (req,res,next) => {

        if (!req.isAuthenticated()) {
             return  next();
        }
        
        let category;
      
        Category.find()
    
             .then( cat => {    
    
                 category = cat
    
                 res.render("index", {
    
                     isAuthenticated:req.user,
                     title:" Strona główna",
                     csrfToken: req.csrfToken(),
                     categories:category
           
                });
    
             })
    
             .catch(err => {           
    
                const error                = new Error(err);
                      error.httpStatusCode = 500;
        
                 return next(error);
             });

         userId = req.user._id

    },

    isAdmin : (req,res,next) => {


        User.findById("5f70fb983ba82c017ccf5633")

             .then( () => {

                 if(req.user._id.toString() === "5f70fb983ba82c017ccf5633" ){

                    return next()
                    
                 } else { 

                    User.findById("5efcaef97848ce001701e3e5")
                        
                         .then( () => {

                             if(req.user._id.toString() !== "5efcaef97848ce001701e3e5" ){  

                                 return res.redirect("/logowanie")

                             }

                             return next()

                         })

                 } 

                 

                     
             })

             .catch( err => { 

                 console.log(err);

                 const error = new Error(err);
                       error.httpStatusCode = 500;

                 return next(error);

             })
    }

}