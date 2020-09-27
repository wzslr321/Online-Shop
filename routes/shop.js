const express        = require("express"),
      shopController = require("../controllers/shop"),
      router         = express.Router();

const {isAuthorized} = require("../config/auth")



router.get("/sklep",                                                shopController.getProducts);

router.get("/sklep/:productId",                                      shopController.getProduct);

router.get("/koszyk",                              isAuthorized,     shopController.getCart);

router.post("/koszyk",                             isAuthorized,     shopController.postCart);

router.post("/koszyk/usun-produkt",                isAuthorized,     shopController.deleteCartProduct);
   
router.get("/sprawdzenie-platnosci",               isAuthorized,     shopController.getCheckout);

router.get("/sprawdzenie-platnosci/sukces",        isAuthorized,     shopController.postOrder);

router.get("/sprawdzenie-platnosci/niepowodzenie", isAuthorized,     shopController.getCheckout);
       
router.get("/zamowienia/:orderId",                 isAuthorized,     shopController.getOrderConfirmation);

router.get("/konto",                               isAuthorized,     shopController.getAccountRoute);

router.get("/sklep/kategorie/:category",                             shopController.getCategory); 
        
router.get("/sklep/pod-kategorie/:subcategory",                      shopController.getSubCategory); 

router.get("/dane-zamowienia",                                       shopController.getOrderWithoutAuth)

router.post("/dane-zamowienia",                                      shopController.postCheckOrderWithoutAuth  )

router.post("/zamowienie-pobranie",                                  shopController.postOrderWithoutAuth)    

module.exports = router;