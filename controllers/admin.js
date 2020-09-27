/* PAGE MADE BY WIKTOR ZAJĄC -- ALL RIGTS RESERVED! */

const Product     = require("../models/product"),
      order       = require("../models/order"),
      user        = require("../models/user"),
      orderNoAuth = require("../models/no-auth-order"),
      noAuthUser  = require("../models/no-auth-user"),
      Category    = require("../models/categories"),
      SubCategory = require("../models/subCategory"),
      fileDel     = require("../useful/file");

      const  nodemailer         = require("nodemailer"),
      sendGridTrasnsport = require("nodemailer-sendgrid-transport");

      require("dotenv").config({path:".env"})

const transporter        = nodemailer.createTransport(sendGridTrasnsport({

   auth:{

     api_key:process.env.API_KEY

   }

}));

/* ===================================== */

exports.getProducts = (req,res,next) => {

    Product.find()

        .then(products => {

            let category;
      
            Category.find()

                 .then( cat => {    

                 category = cat 

                
                     res.render("admin/products", {

                         products:products,
                         title:"Wszystkie produkty",
                         isAuthenticated:req.user,
                         path:"admin/produkty",
                         category:category,
                         orderNoAuth:undefined,
                         order:undefined
    
                  });

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

/* ========================================== */

exports.AddProduct = (req,res,next) => {

    
    Category.find()

         .then(selectCategory => {

             SubCategory.find()

                 .then(subCategory => {

                    const subCategorySelect = subCategory

                    var subCategoryData = [];

                   for(let i = 0; i < subCategory.length; i++){

                         subCategoryData.push(subCategory[i].name)
                   }

                    const categorySelect = selectCategory

                    var categoryData = [];

                   for(let i = 0; i < selectCategory.length; i++){

                         categoryData.push(selectCategory[i].name)
                   }


                    res.render("admin/edit-product", {

                        categorySelect,
                        categoryData,
                        subCategorySelect,
                        subCategoryData,
                        title:"Dodaj produkt!",
                        editing:false,
                        isAuthenticated:req.user,
                        path:"admin/dodaj-produkt",
                        orderNoAuth:undefined,
                        order:undefined
                
                    });
                 })

         })

         .catch(err => {         

            const error = new Error(err);
                  error.httpStatusCode = 500;

             return next(error);

         });

    
}

/* ========================================== */

exports.postProduct = (req,res,next) => {

    const title               = req.body.title,
          image               = req.file,
          price               = req.body.price,
          description         = req.body.description,
          category            = req.body.selectCategory,
          subCategory         = req.body.subCategory,
          descriptionExtended = req.body.descriptionExtended;

     if(!image){
           return res.send("Zły format zdjęcia")
          
     } else {
         console.log("Pomyślnie dodano zdjęcie");
     }

     const imageUrl = image.path;

    const product = new Product({
         title,
         price,
         description,
         category,
         subCategory,
         descriptionExtended,
         imageUrl,
         userId:req.user
    });

    console.log(product)

    product.save()

         .then( () => res.redirect("/admin/produkty"))

         .catch(err => {             

            const error = new Error(err);
                  error.httpStatusCode = 500;

             return next(error);
    });

}

/* ========================================== */

exports.editProduct = (req, res, next) => {

     const editMode = req.query.edit;

    if (!editMode) {

         return res.redirect('/');

    }

     const prodId = req.params.productId;
    
    Product.findById(prodId)

         .then(product => {

            if (!product) {

                 return res.redirect('/');

            }
            Category.find()

            .then(selectCategory => {
   
                SubCategory.find()
   
                    .then(subCategory => {
   
                       const subCategorySelect = subCategory
   
                       var subCategoryData = [];
   
                      for(let i = 0; i < subCategory.length; i++){
   
                            subCategoryData.push(subCategory[i].name)
                      }
   
                       console.log(...subCategoryData)
   
                       const categorySelect = selectCategory
   
                       var categoryData = [];
   
                      for(let i = 0; i < selectCategory.length; i++){
   
                            categoryData.push(selectCategory[i].name)
                      }
   
   
                       res.render("admin/edit-product", {
   
                           categorySelect,
                           categoryData,
                           subCategorySelect,
                           subCategoryData,
                           title:"Edytuj produkt!",
                           editing:editMode,
                           product:product,
                           isAuthenticated:req.user,
                           path:"admin/dodaj-produkt",
                           orderNoAuth:undefined,
                           order:undefined
                   
                       });
                    })
   
            })
   
      })

      .catch(err => {   

        const error = new Error(err);
              error.httpStatusCode = 500;

         return next(error);
});

};

/* ========================================== */

exports.postEditProduct = (req,res,next) => {

    const prodId           = req.body.productId,
          updatedTitle     = req.body.title,
          updatedPrice     = req.body.price,
          image            = req.file,
          updatedDesc      = req.body.description;

    Product.findById(prodId)

        .then(product => {

             product.title       = updatedTitle
             product.price       = updatedPrice

             if(image) {

                fileDel.deleteFile(product.imageUrl)
                product.imageUrl = image.path

             }

             product.description = updatedDesc;

             return product.save()

        })

        .then( () => res.redirect("/admin/produkty"))

        .catch(err => {      
            
            const error = new Error(err);
                  error.httpStatusCode = 500;

             return next(error);

    });
}

/* ========================================== */

exports.deleteProduct = (req,res,next) => {

     const prodId = req.body.productId;

    Product.findById(prodId)

         .then(product => {

             if(!product) {

                 return next(new Error(" Nie znaleziono produktu "))

             } else {


                 fileDel.deleteFile(product.imageUrl)
                 return  Product.findByIdAndRemove(prodId)

             }

         })

         .then( () => res.redirect("/admin/produkty"))

         .catch(err => {    
                           
            const error = new Error(err);
                  error.httpStatusCode = 500;

             return next(error);
   
    });
}

/* ========================================== */


exports.getAddCategory = (req,res,next) => {

    res.render("admin/add-category", {
        title:"Dodaj kategorię",
        path:"admin/dodaj-kategorie",
        orderNoAuth:undefined,
        order:undefined
    })

}

exports.postAddCategory = (req,res,next) => {

     const name             = req.body.category,
           subCategoryName  = req.body.subCategory;  

     if(name !== undefined) {

         const categoryData = new Category({
             name,  
         })
  
         categoryData.save()
         
             .then(() => {
                 return res.redirect("/admin/dodaj-kategorie")
             })

             .catch(err => {    
                    
                 const error = new Error(err);
                       error.httpStatusCode = 500;

                 return next(error);

             });

     }      

     if(subCategoryName !== undefined) {

        const subCategoryData = new SubCategory({
            name:subCategoryName      
        })
   
        subCategoryData.save()

             .then(() => {
                 return res.redirect("/admin/dodaj-kategorie")
             })

              .catch(err => {    
                         
                 const error = new Error(err);
                       error.httpStatusCode = 500;

                 return next(error);
 
       });

     }



}

/* ========================================== */

exports.getOrdersList = (req,res,next) => {

    let noAuthUserId = [];
    let isRealised;
    let isSent;

     noAuthUser.find()

         .then(  userNoAuth => {

            let prodId

            for(let i = 0; i < userNoAuth.length; i++){

                 prodId = userNoAuth[i].productId
                 noAuthUserId.push(userNoAuth[i]._id) 

            }

          

             Product.findById(prodId)

                 .then( prodNoAuth => {

                     orderNoAuth.find({noAuthUserId:noAuthUserId})
                      
                         .then( orderNoAuth => {

                            OrderNoAuth = orderNoAuth

                            order.find()

                            .then(order => {
                   
                               let UserEmail = [];
                   
                                for(let i = 0; i < order.length; i++) {
                   
                                    UserEmail.push( order[i].user.email) 
                                    
                                    order[i].isRealised = Boolean
                                    isRealised          = order[i].isRealised

                                    order[i].isSent     = Boolean
                                    isSent              = order[i].isSent
                   
                                }
                   
                                for(let i = 0; i < order.length; i++) {
                   
                                     var orderProducts = order[i].products
                   
                                }
                   
                   
                                user.findOne({email:UserEmail})
                   
                   
                                    .then(user => {
                   
                   
                   
                                         var UserOrder = user
                   
                                         res.render("admin/orders-list", {
                   
                                           title:"Zamówienia",
                                           order:order,
                                           user:UserOrder,
                                           products: orderProducts,
                                           isAuthenticated:req.user,
                                           productsNoAuth:prodNoAuth,
                                           userNoAuth:userNoAuth,
                                           orderNoAuth:orderNoAuth,
                                           path:"admin/zamowienia",
                                           isRealised,
                                           isSent
                   
                                    })
                                    
                            }); 
                   
                        })

                         })

                })

             

         })

         .catch(err => {    
                        
            const error = new Error(err);
                  error.httpStatusCode = 500;
 
            return next(error);
 
         });



}

exports.getIdOrdersList = (req,res,next) => {

    const id = req.params.id

    let userEmail = [];
    let userOrder;
    let userNoAuthId = [];
    let prodNoAuthId;
    let userNoAuthEmail;
    let Order;
    let UserOrder;
    let orderProducts;
    let UserNoAuth;
    let OrderNoAuth;
    let ProdNoAuth;
    let orderNoAuth_id


   
    orderNoAuth.find({_id:id})

         .then( orderNoAuth => {

            if(orderNoAuth.length < 1){
                order.find({_id:id})

                .then( order => {

                   Order = order


                    for(let i = 0; i < order.length; i++) { 

                        userEmail.push(order[i].user.email)
                        order[i].isRealised = Boolean
                        orderProducts = order[i].products,
                        order[i].isSent     = Boolean

                    }

                    user.findOne({email:userEmail})

                        .then(user => {

                           UserOrder = user

                           console.log(order)

                              return res.render("admin/orders-list", {
                                   
                                   title:"Zamówienia1",
                                   order:Order,
                                   user:UserOrder,
                                   products: orderProducts,
                                   isAuthenticated:req.user,
                                   productsNoAuth:undefined,
                                   userNoAuth:undefined,
                                   orderNoAuth:undefined,
                                   path:"admin/zamowienia/id" ,
                                   orderNoAuth:undefined
                               })


                        })

                         .catch(err => {    
                    
                            const error = new Error(err);
                                  error.httpStatusCode = 500;
       
                            return next(error);
       
                          });

                })
            } else {

                for(let i = 0; i < orderNoAuth.length ; i++){

                    orderNoAuth_id = orderNoAuth[i]._id
            
               }
    
                 if(orderNoAuth_id.toString() === id){
    
                    for(let i = 0; i < orderNoAuth.length; i++) {
    
                        userNoAuthId.push(orderNoAuth[i].noAuthUserId)
                        orderNoAuth[i].isRealised = Boolean
                        OrderNoAuth = orderNoAuth,
                        orderNoAuth[i].isSent = Boolean
    
                    }
    
    
                    noAuthUser.find({_id:userNoAuthId})
    
                         .then( userNoAuth => {
    
                            for(let i = 0; i < userNoAuth.length; i++) { 
    
                                prodNoAuthId = userNoAuth[i].productId
                                userNoAuthEmail = userNoAuth[i].email
                                UserNoAuth = userNoAuth[i]
    
                            }
    
                            Product.findById(prodNoAuthId)
    
                                 .then( prodNoAuth => {
                                     
                                     ProdNoAuth = prodNoAuth;
    
    
                                     res.render("admin/orders-list", {
                       
                                        title:"Zamówienia",
                                        order:undefined,
                                        user:undefined,
                                        products: undefined,
                                        isAuthenticated:req.user,
                                        productsNoAuth:ProdNoAuth,
                                        userNoAuth:UserNoAuth,
                                        orderNoAuth:OrderNoAuth,
                                        path:"admin/zamowienia/id" 
                                    })
                                    
                                 })
    
    
                         })
    
    
                 } 
    

            }

 
         })


}


exports.deleteCategory = (req,res,next) => {

     const name = req.body.category

     Category.find({name:name})

          .then( (cat) => {

                 if(cat) {

                    Category.findById(cat)

                    .then( catid => {

                         const cat_id = catid._id

                         res.redirect("/admin/dodaj-kategorie")
                         return Category.findByIdAndRemove(cat_id)

                    })
                    .catch(err => {    
                         
                        const error = new Error(err);
                              error.httpStatusCode = 500;
            
                        return next(error);
            
                     });

                 } else {

                      return res.redirect("/admin/dodaj-kategorie")

                 }

          })
          
          .catch(err => {    
                         
            const error = new Error(err);
                  error.httpStatusCode = 500;

            return next(error);

         });

}

exports.deleteSubCategory = (req,res,next) => {

    const name = req.body.subCategory

    SubCategory.find({name:name})
    
         .then( (cat) => {

                if(cat) {

                   SubCategory.findById(cat)

                   .then( catid => {

                        const cat_id = catid._id

                        res.redirect("/admin/dodaj-kategorie")
                        return SubCategory.findByIdAndRemove(cat_id)

                   })
                   .catch(err => {    
                        
                       const error = new Error(err);
                             error.httpStatusCode = 500;
           
                       return next(error);
           
                    });

                } else {

                     return res.redirect("/admin/dodaj-kategorie")

                }

         })
         
         .catch(err => {    
                        
           const error = new Error(err);
                 error.httpStatusCode = 500;

           return next(error);

        });

}


exports.postOrdersCheck = (req,res,next) => {

     const  orderId     = req.body.orderId,
            OrderNoAuth = req.body.orderNoAuth

     if(OrderNoAuth !== undefined) {
         orderNoAuth.findById(orderId)
              .then(order => {
                  order.isRealised = true

                  order.save( () => {

                     return res.redirect("/admin/zamowienia")

                  })

              })

              .catch(err => {    
                       
                const error = new Error(err);
                      error.httpStatusCode = 500;
     
                return next(error);
     
             }); 

     } else {

        order.findById(orderId)
        .then( order => {
           console.log(order)
            order.isRealised = true 

            order.save( () => {

                return res.redirect("/admin/zamowienia")
            })


        })


        .catch(err => {    
                       
           const error = new Error(err);
                 error.httpStatusCode = 500;

           return next(error);

        });

     }

     

}

exports.getAdminCategory = (req,res,next) => {

    const categoryParam = req.params.category

    let noMatch = null;

    Category.find({name:categoryParam})       

    
         .then( (catParam) => {

             let catParamName
       
             for(let i = 0; i < catParam.length; i++){      
                  
                 catParamName = catParam[i].name

             }

            Product.find({category:catParamName})

                .then( products => {

                    if(!products){
                         noMatch = "Nie znaleziono pasujących produktów"
                    }

                    let category;
                    let categorySubcat;
                    let subCategory;


                   Category.find()
        
                     .then( cat => {    
        
                         category = cat
                         
                         for(let i = 0; i < products.length; i++){
                             categorySubcat = products[i].subCategory
                         }



                    SubCategory.find()

                         .then(subcat => { 

                             subCategory = subcat;

                             res.render("admin/products", {
                            
                                isAuthenticated:req.user,
                                title:" Strona główna",
                                csrfToken: req.csrfToken(),
                                category:category,
                                subCategories:subCategory,
                                categorySubcat:categorySubcat,
                                products:products,
                                noMatch:noMatch,
                                path:"admin/produkty",
                                orderNoAuth:undefined,
                                order:undefined
                 
                             });   

                         })
        
        
                 })
        
                 .catch(err => {           
        
                    const error                = new Error(err);
                          error.httpStatusCode = 500;
            
                     return next(error);

                 });

             }) 

         })

      
}


exports.postShip = (req,res,next) => {

     const  orderId     = req.body.orderId,
            OrderNoAuth = req.body.orderNoAuth

     if(OrderNoAuth !== undefined) {

         orderNoAuth.findById(orderId)

            .then(order => {

                let userId = order.noAuthUserId;

                noAuthUser.findById(userId)

                     .then( user => {


                        transporter.sendMail({
                  
                            to     : user.email,
                            from   :"wzslr321@op.pl",
                            subject:"Wysłano  zamówienie",
                            html   : `
                            <h3> Drogi użytkowniku strony (...) </h3>
                            <h5> Wysłaliśmy twoje zamówienie. </h5>
                            <p> <a href = "http://localhost:3000/zamowienia/${order._id}"> Pełne potwierdzenie zamówienia </a> </p>
                            
                            `
        
                        });
        
                        order.isSent = true
        
                        order.save( () => {
        
                            return res.redirect("/admin/zamowienia")
        
                        })

                     })

                     .catch(err => {    
                    
                        const error = new Error(err);
                              error.httpStatusCode = 500;
       
                        return next(error);
       
                   }); 

            })

            .catch(err => {    
                    
                 const error = new Error(err);
                       error.httpStatusCode = 500;

                 return next(error);

            }); 

        } else {

        order.findById(orderId)

             .then( order => {

                 order.isSent = true 

                 order.save( () => {

                     return res.redirect("/admin/zamowienia")
                 })


        })


        .catch(err => {    
                    
         const error = new Error(err);
               error.httpStatusCode = 500;

         return next(error);

        });

     }
     

}


