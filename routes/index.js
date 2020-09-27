const express              = require("express"),
      indexController      = require("../controllers/indexController"),
      router               = express.Router(),
      {sendAuthentication} = require("../config/auth");

router.get("/", sendAuthentication, indexController.getIndex)

module.exports = router     