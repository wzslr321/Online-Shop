const express  = require("express"),
      router   = express.Router(),
      passport = require("passport"),
      auth     = require("../controllers/authenticationController");

const {isVerified, isAuthorized} = require("../config/auth")
 

router.get("/logowanie", auth.getLoginForm );

router.post('/logowanie', (req, res, next) => {

    passport.authenticate('local-login',  {

       successRedirect:"/",
       failureRedirect: '/logowanie',
       failureFlash:"Uzupełnij wszystkie pola",
       failureFlash:true
       
    })(req, res, next);
  });

router.post("/wyloguj", auth.Logout);

router.get("/wyloguj",  auth.Logout);


router.get("/rejerstracja",  auth.getRegisterForm);

router.post("/rejerstracja", auth.postRegisterForm);

router.get("/weryfikacja/:emailToken", auth.getVerified)


router.get("/reset",  auth.getReset)

router.post("/reset", auth.postReset)


router.get("/reset/:token",  auth.getNewPassword)

router.post("/new-password", auth.postNewPassword)


router.get("/weryfikacja-wysylka",   auth.getShipVerification)

router.post("/weryfikacja-wysylka",  auth.postShipVerification)




module.exports = router;