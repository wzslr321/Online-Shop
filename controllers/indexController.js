const Category = require("../models/categories");

exports.getIndex = (req,res,next) => {

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

}     