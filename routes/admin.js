const express         = require("express"),
      adminController = require("../controllers/admin"),
      router          = express.Router();
      
const {isAuthorized , isAdmin} = require("../config/auth")


router.get("/dodaj-produkt",             isAuthorized,  isAdmin, adminController.AddProduct);

router.post("/dodaj-produkt",            isAuthorized,  isAdmin, adminController.postProduct);

router.get("/produkty",                  isAuthorized,  isAdmin, adminController.getProducts)

router.get("/edytuj-produkt/:productId", isAuthorized,  isAdmin, adminController.editProduct)

router.post("/edytuj-produkt",           isAuthorized,  isAdmin, adminController.postEditProduct)

router.post("/usun-produkt",             isAuthorized,  isAdmin, adminController.deleteProduct)

router.get("/zamowienia",                isAuthorized,  isAdmin, adminController.getOrdersList)

router.get("/zamowienia/:id",            isAuthorized,  isAdmin, adminController.getIdOrdersList)

router.post("/zamowienia",               isAuthorized,  isAdmin, adminController.postOrdersCheck)

router.get("/dodaj-kategorie",           isAuthorized,  isAdmin, adminController.getAddCategory)

router.post("/dodaj-kategorie",          isAuthorized,  isAdmin, adminController.postAddCategory)

router.post("/usun-pod-kategorie",       isAuthorized,  isAdmin, adminController.deleteSubCategory)

router.post("/usun-kategorie",           isAuthorized,  isAdmin, adminController.deleteCategory)

router.get("/kategorie/:category",       isAuthorized,  isAdmin, adminController.getAdminCategory)

router.post("/zamowienia/wysylka",       isAuthorized,  isAdmin, adminController.postShip )

module.exports = router;