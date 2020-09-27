const express  = require("express"),
      router   = express.Router(),
      errorRoutes = require("../controllers/errorsController");

router.use("/500", errorRoutes.get500)

router.use(        errorRoutes.get404)

module.exports = router;