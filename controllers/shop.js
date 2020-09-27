
require("dotenv").config({path:".env"})

const  nodemailer         = require("nodemailer"),
       sendGridTrasnsport = require("nodemailer-sendgrid-transport");

const transporter        = nodemailer.createTransport(sendGridTrasnsport({

    auth:{

      api_key:process.env.API_KEY

    }

 }));


const fs          = require("fs"),
      path        = require("path"),
      stripe      = require("stripe")(process.env.STRIPE_SECRET_KEY),
      PDFDoc      = require("pdfkit");

const Product     = require("../models/product"),
      Order       = require('../models/order'),
      orderNoAuth = require("../models/no-auth-order"),
      Category    = require("../models/categories"),
      SubCategory = require("../models/subCategory"),
      user        = require("../models/user");
const noAuthUser = require("../models/no-auth-user");

const escapeRegex = text => {

     return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

};

/* ======================================== */

exports.getProducts = (req,res) => {

     let noMatch = null;

    if(req.query.search){

         const regex = new RegExp(escapeRegex(req.query.search), "gi");
     
     Product.find({title:regex}, (error,products) => {

        if(error){      

            const error = new Error(err);
                  error.httpStatusCode = 500;

             return next(error);

        } else {

            if(products.length < 1){

                 noMatch = "Nie znaleziono pasujących produktów"

            }

            let category;
            let subCategory;
            let categorySubcat;
      
            Category.find()
        
                 .then( cat => {    
        
                     category = cat

                     SubCategory.find()

                         .then( subcat => {

                             subCategory = subcat
                            
                             for(let i = 0; i < products.length; i++){
                                 categorySubcat = products[i].subCategory
                             }

                             res.render("shop/shop", {
        
                                isAuthenticated:req.user,
                                title:" Sstrona główna",
                                csrfToken: req.csrfToken(),
                                categories:category,
                                subCategories : subCategory,
                                categorySubcat,
                                products:products,
                                noMatch:noMatch
                      
                           });

                         })
        
        
                 })
        
                 .catch(err => {           
        
                    const error                = new Error(err);
                          error.httpStatusCode = 500;
            
                     return next(error);
                 });
        }
    });

} else {

    Product.find({}, (error,products) => {

        if(error) {

            const error                 = new Error(err);
                   error.httpStatusCode = 500;

             return next(error);

        } else {

            let category;

            Category.find()
        
                 .then( cat => {    
        
                     category = cat
        
                     res.render("shop/shop", {
        
                         isAuthenticated:req.user,
                         title:" Strona główna",
                         csrfToken: req.csrfToken(),
                         categories:category,
                         subCategories:undefined,
                         products:products,
                         noMatch:noMatch
               
                    });
        
                 })
        
                 .catch(err => {           
        
                    const error                = new Error(err);
                          error.httpStatusCode = 500;
            
                     return next(error);
                 });

        }
});      
}};

/* ======================================== */

exports.getProduct = (req,res,next) => {

     const prodID= req.params.productId;

    Product.findById(prodID)

        .then(product => {

             res.render("shop/product-detail", {

                 product:product,
                 title  :product.title,
                 isAuthenticated:req.user

            });
        })

        .catch(err => {           

            const error                = new Error(err);
                  error.httpStatusCode = 500;
    
             return next(error);
    });
}

/* ======================================== */

exports.postCart = (req,res,next) => {

     const prodID = req.body.productId;
    
    Product.findById(prodID)

        .then(product => {
             return req.user.addToCart(product);
        })

        .then( ()  => res.redirect("/koszyk") )

        .catch(err => {           

            const error                = new Error(err);
                  error.httpStatusCode = 500;
    
            return next(error);
    });
}

/* ======================================== */

exports.getCart = (req,res,next) => {

    req.user.populate("cart.items.productId").execPopulate()

        .then(user => {

             const products = user.cart.items;

             res.render("shop/cart", {

                title   :"Twój koszyk",
                isAuthenticated:req.user,
                products:products

            });
        })

        .catch(err => {     

            const error = new Error(err);
                  error.httpStatusCode = 500;
    
            return next(error);
    });
}

/* ======================================== */

exports.deleteCartProduct = (req,res,next) => {

     const prodID = req.body.productId;

    req.user.removeFromCart(prodID)

         .then( ()   => res.redirect("/koszyk") )

         .catch( err => {           

            const error = new Error(err);
                  error.httpStatusCode = 500;
    
            return next(error);

    });
}

/* ======================================== */

exports.postOrder = (req,res,next) => {


    req.user.populate("cart.items.productId")

         .execPopulate()

         .then( user => {

             const products = user.cart.items.map(i => {

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

            return order.save();
        })
        
         user.findOne({email: req.user.email})

             .then( user => {

                 user.cart = [];
                 user.save();

             })

         .then( ()  => {

             Order.findOne({"user.email":req.user.email})

                 .then( order => {

                     transporter.sendMail({
                  
                            to     :req.user.email,
                            from   :"wzslr321@op.pl",
                            subject:"Potwierdzenie zamówienia",
                            html   : `
                            <h3> Drogi użytkowniku strony (...) </h3>
                            <h5> Przyjeliśmy twoje zamówienie. </h5>
                            <p> <a href = "http://localhost:3000/zamowienia/${order._id}"> Pełne potwierdzenie zamówienia </a> </p>
                            
                            `

                     });

                     return  res.redirect("/konto") 

                 })

                 .catch( err => {           

                    const error                = new Error(err);
                          error.httpStatusCode = 500;
            
                     return next(error);
        
            });

             

         

         })

         .catch( err => {           

            const error                = new Error(err);
                  error.httpStatusCode = 500;
    
             return next(error);

    });
};

/* ======================================== */

exports.getOrderConfirmation = (req,res,next) => {

     const orderId          = req.params.orderId;
          
     Order.findById(orderId)

         .then((order,error) => {

             if(!order){

                 orderNoAuth.findById(orderId)
                     
                     .then((order,error) => {

                        const confirmationName = `Potwierdzenie zamówienia ${order._id}.pdf`,
                        invoicePath      = path.join("order-confirms", confirmationName);
                  
                  const pdfDoc = new PDFDoc();
 
                  pdfDoc.info["Title"] = "Potwierdzenie zamówienia"
 
                  res.setHeader("Content-type", "charset=utf-8");
                  res.setHeader("Content-Type", "application/pdf",);
                  res.setHeader("Content-Disposition", `inline; filename=${confirmationName} `)
                  res.writeHead(200,{
 
                      "Content-Type" : "application/pdf"
 
                  })
 
                  pdfDoc.registerFont('Cardo', 'Cardo/Cardo-Regular.ttf')
                  pdfDoc.font('Cardo')
 
 
                  pdfDoc.pipe(fs.createWriteStream(invoicePath));
                  pdfDoc.pipe(res);
 
                  pdfDoc.text(`Numer zamówienia : ${order._id}`)
                        .moveDown(2.0)
                        
     
                  for(let i = 0; i < order.products.length; i++){
 
                     pdfDoc.fontSize("20")
                     pdfDoc.text(`Nazwa produktu : ${order.products[i].product.title}`, {
                          align:"center",
                     })
                          .moveDown(0.5)
 
                     pdfDoc.fontSize("15")
                     pdfDoc.text(`Ilość produktów : ${order.products[i].quantity}`)
                         .moveDown(0.5);     
 
                     pdfDoc.fontSize("15")
                     pdfDoc.text(`Cena produktu : ${order.products[i].product.price}`)
                           .moveDown(0.5)
 
                     pdfDoc.text(`Opis produktu :`)
                           .moveDown(0.5)
 
                     pdfDoc.text(`${order.products[i].product.description,order.products[i].product.descriptionExtended }`)
                           .moveDown(0.5)
 
                  }
 
               
                  pdfDoc.fontSize("17")
                  pdfDoc.text("Dane do wysyłki : ", {
                    align:"center"
                   })
                        .moveDown(0.5)
 
                     noAuthUser.find({email:order.user.email})
 
                          .then(user => {

                             for(let i = 0;  i < user.length; i++){
 
                                 pdfDoc.fontSize("13")
 
                                 pdfDoc.text(`Kraj : ${user[i].shippingCart[i].country}`)
                                       .moveDown(0.5)
                                 pdfDoc.text(`Miasto : ${user[i].shippingCart[i].city}`)
                                       .moveDown(0.5)
                                 pdfDoc.text(`Kod pocztowy : ${user[i].shippingCart[i].zipCode}`)
                                       .moveDown(0.5)
                                 pdfDoc.text(`Ulica : ${user[i].shippingCart[i].street}`)
                                       .moveDown(0.5)
                                 pdfDoc.text(`Numer domu/mieszkania : ${user[i].shippingCart[i].houseNumber}`)
                                       .moveDown(3.0)
 
                                 pdfDoc.fontSize("20")      
                                 pdfDoc.text("W przypadku wprowadzenia złych danych do wysyłki, lub  złego produktu prosimy o kontakt na e-mail :  email.firmy@op.pl ",{
                                      align:"left"
                                 })
                                 pdfDoc.end()
                             }
 
    
                          })
 
                          .catch(err => { 
 
                             const error = new Error(err);
                                  error.httpStatusCode = 500;
             
                                  return next(error); 
 
                         })
                        
                     })

             }

             if(order.user.userId.toString() !== req.user._id.toString()){

                  return res.send("Nie jesteś uprawniony do przeglądania tej strony")

             }

             else{     

                 const confirmationName = `Potwierdzenie zamówienia ${order._id}.pdf`,
                       invoicePath      = path.join("order-confirms", confirmationName);
                 
                 const pdfDoc = new PDFDoc();

                 pdfDoc.info["Title"] = "Potwierdzenie zamówienia"

                 res.setHeader("Content-type", "charset=utf-8");
                 res.setHeader("Content-Type", "application/pdf",);
                 res.setHeader("Content-Disposition", `inline; filename=${confirmationName} `)
                 res.writeHead(200,{

                     "Content-Type" : "application/pdf"

                 })

                 pdfDoc.registerFont('Cardo', 'Cardo/Cardo-Regular.ttf')
                 pdfDoc.font('Cardo')


                 pdfDoc.pipe(fs.createWriteStream(invoicePath));
                 pdfDoc.pipe(res);

                 pdfDoc.text(`Numer zamówienia : ${order._id}`)
                       .moveDown(2.0)
 
    
                 for(let i = 0; i < order.products.length; i++){

                    pdfDoc.fontSize("20")
                    pdfDoc.text(`Nazwa produktu : ${order.products[i].product.title}`, {
                         align:"center",
                    })
                         .moveDown(0.5)

                    pdfDoc.fontSize("15")
                    pdfDoc.text(`Ilość produktów : ${order.products[i].quantity}`)
                        .moveDown(0.5);     

                    pdfDoc.fontSize("15")
                    pdfDoc.text(`Cena produktu : ${order.products[i].product.price}`)
                          .moveDown(0.5)

                    pdfDoc.text(`Opis produktu :`)
                          .moveDown(0.5)

                    pdfDoc.text(`${order.products[i].product.description,order.products[i].product.descriptionExtended }`)
                          .moveDown(0.5)

                 }

              
                 pdfDoc.fontSize("17")
                 pdfDoc.text("Dane do wysyłki : ", {
                   align:"center"
                  })
                       .moveDown(0.5)

                    user.find({email:order.user.email})

                         .then(user => {

                            for(let i = 0;  i < user.length; i++){

                                pdfDoc.fontSize("13")

                                pdfDoc.text(`Kraj : ${user[i].shippingCart[i].country}`)
                                      .moveDown(0.5)
                                pdfDoc.text(`Miasto : ${user[i].shippingCart[i].city}`)
                                      .moveDown(0.5)
                                pdfDoc.text(`Kod pocztowy : ${user[i].shippingCart[i].zipCode}`)
                                      .moveDown(0.5)
                                pdfDoc.text(`Ulica : ${user[i].shippingCart[i].street}`)
                                      .moveDown(0.5)
                                pdfDoc.text(`Numer domu/mieszkania : ${user[i].shippingCart[i].houseNumber}`)
                                      .moveDown(3.0)

                                pdfDoc.fontSize("20")      
                                pdfDoc.text("W przypadku wprowadzenia złych danych do wysyłki, lub  złego produktu prosimy o kontakt na e-mail :  email.firmy@op.pl ",{
                                     align:"left"
                                })
                                pdfDoc.end()
                            }

   
                         })

                         .catch(err => { 

                            const error = new Error(err);
                                 error.httpStatusCode = 500;
            
                                 return next(error); 

                        })

             }
        })

         .catch( error => next(error) )
}


/* ======================================== */


exports.getAccountRoute = (req,res,next) => { 
    
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

            res.render("shop/user-panel", {
        
                title : "Panel użytkownika",
                isAuthenticated:req.user,
                email,
                order,
                products,
                User,
                firstName,
                secondName,
                shippingCart
       
           });
     
         })    

         .catch(err => {           
        
            const error                = new Error(err);
                  error.httpStatusCode = 500;
    
             return next(error);

         });
         

}

/* ======================================== */

exports.getCategory = (req,res,next) => {

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

                             res.render("shop/shop", {
                            
                                isAuthenticated:req.user,
                                title:" Strona główna",
                                csrfToken: req.csrfToken(),
                                categories:category,
                                subCategories:subCategory,
                                categorySubcat:categorySubcat,
                                products:products,
                                noMatch:noMatch
                 
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

/* ======================================== */

exports.getSubCategory = (req,res,next) => {

    const subCategoryParam = req.params.subcategory

    
    console.log("subCatParamName")  

    let noMatch = null;
     
     SubCategory.find({name:subCategoryParam})       
       
         .then( (subCatParam) => {
     
             let subCatParamName
       
             for(let i = 0; i < subCatParam.length; i++){      
                  
                 subCatParamName = subCatParam[i].name

             }
    
            Product.find({subCategory:subCatParamName})   
            
                .then( products => {                                      
      
                    if(!products){
                         noMatch = "Nie znaleziono pasujących produktów"
                    }

                    let category;     
                    let subCategory;

                   Category.find()
        
                     .then( cat => {    
        
                         category = cat


                    SubCategory.find()

                         .then(subcat => {

                             subCategory = subcat;      
                             

                             res.render("shop/shop", {
                            
                                isAuthenticated:req.user,
                                title:" Strona główna",
                                csrfToken: req.csrfToken(),
                                categories:category,
                                subCategories:subCategory,
                                products:products,
                                noMatch:noMatch,
                 
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

exports.getCheckout = (req,res,next) => {

    let products;
    let totalP;
    let shipCost;

    req.user
         .populate("cart.items.productId")
         .execPopulate()

    .then(user => {

         products = user.cart.items;
         
         totalP  = 0

         products.forEach(prod => {

              totalP += Math.round((prod.quantity * prod.productId.price)  + prod.quantity * Math.round((8 / prod.quantity)))

         })

    

         return stripe.checkout.sessions.create({

              payment_method_types:["card"],
              line_items:products.map( p => {

                 shipCost = Math.round(8 / p.quantity)

                 return {

                      name:p.productId.title,
                      description:p.productId.description,
                      amount:( p.productId.price * 100 ) + (shipCost * 100),
                      currency:"PLN",
                      quantity:p.quantity
                      
                 };
              }),

              success_url: `${req.protocol}://${req.get("host")}/sprawdzenie-platnosci/sukces`,
              cancel_url : `${req.protocol}://${req.get("host")}/sprawdzenie-platnosci/niepowodzenie`

         });

    })


    .then(session => {

        user.find({name:req.user.name})
             .then(user => {
                 user.cart = []
                 user.save
             })

        res.render("shop/check-payments", {

            title   :"Płatność",
            isAuthenticated:req.user,
            products:products,
            totalPrice:totalP,
            sessionId:session.id

        });

    })

    .catch(err => {           

        const error                = new Error(err);
              error.httpStatusCode = 500;

        return next(error);
});
    
}

exports.postCheckOrderWithoutAuth = (req,res,next) => {

    const prodID = req.body.productId;

    Product.findById(prodID)

         .then(prod => {
              
             res.render("authentication/ship-verification",{
                 title:"Dane do zamówienia",
                 products:prod,
                 noAuth:true,
                 errors:undefined
             })

         })

         .catch(err => {           

            const error                = new Error(err);
                  error.httpStatusCode = 500;
    
            return next(error);
         });
     
}


exports.getOrderWithoutAuth = (req,res,next) => {

     const prodID = req.body.productId;
    
     Product.findById(prodID)

         .then( prod => {  
             
             res.render("authentication/ship-verification",{
                  
                 title:"Dane do zamówienia",
                 products:prod,
                 name:undefined,
                 ndName:undefined,
                 noAuth:true,
                 errors:undefined
                     
             })

         })

         .catch(err => {           

            const error                = new Error(err);
                  error.httpStatusCode = 500;
    
            return next(error);
         });
     

}

exports.postOrderWithoutAuth = (req,res,next) => {

    let noAuthUserid 
    let productsData


         const {city,noAuthEmailInput,country,zipCode,houseNumber,street, productId, name, ndName} = req.body

         const NoAuthUser = new noAuthUser({

                city,
                email : noAuthEmailInput,
                country,
                zipCode, 
                houseNumber,
                street,
                productId,
                name,
                ndName

         })

         let errors = [];

         if(!city || !country || !zipCode || !houseNumber || !street  || !name || !ndName){

             errors.push("Uzupełnij wszystkie pola")

         }


         if(errors.length > 0 ){

            const prodID = req.body.productId;
    
            Product.findById(prodID)
       
                .then( prod => {  

                    console.log(errors)
                    
                    res.render("authentication/ship-verification",{
                         
                        title:"Dane do zamówienia",
                        products:prod,
                        name:undefined,
                        ndName:undefined,
                        noAuth:true,
                        errors
                            
                    })
       
                })
       
                .catch(err => {           
       
                   const error                = new Error(err);
                         error.httpStatusCode = 500;
           
                   return next(error);
                });

        
         } else {
            noAuthUserid = NoAuthUser._id

            NoAuthUser.save()
   
                .then( (user) => {
   
                   Product.findById(productId)
                        .then(prod => {
                            productsData = prod
   
                        })
                        .catch(err => {           
   
                           const error                = new Error(err);
                                 error.httpStatusCode = 500;
                   
                           return next(error);
                        });
                        
   
   
                    const noAuthOrder = new orderNoAuth({
   
                            noAuthUserId:noAuthUserid,
                            isRealised:false,
                            isSent: false
   
                    })
   
                    noAuthOrder.save()
   
                        .then(() => {
   
                                    orderNoAuth.find({noAuthUserId:noAuthUserid})
                                    .then( order => {
   
                                        res.render("shop/orders-no-auth", {
       
                                            title:"Twoje zamówienie",
                                            orders:order,
                                            user:noAuthUserid,
                                            errors
       
                                        })
       
                                    })
   
                                .catch(err => {           
   
                                   const error                = new Error(err);
                                         error.httpStatusCode = 500;
                           
                                   return next(error);
                                });
   
   
                        })
   
                        .catch(err => {           
   
                           const error                = new Error(err);
                                 error.httpStatusCode = 500;
                   
                           return next(error);
                        });
   
                   
   
                })
   
         }



}
