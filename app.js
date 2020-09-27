/* PAGE MADE BY WIKTOR ZAJĄC -- ALL RIGTS RESERVED! */

const express        = require("express"),
      app            = express(),
      bodyParser     = require("body-parser"),
      mongoose       = require("mongoose"),
      morgan         = require("morgan"),
      csrf           = require("csurf"),
      session        = require("express-session"),
      flash          = require("connect-flash"),
      mongoDBSession = require("connect-mongodb-session")(session),
      passport       = require("passport"),
      multer         = require("multer"),
      User           = require("./models/user");

const indexRoutes    = require("./routes/index"),
      adminRoutes    = require("./routes/admin"),
      shopRoutes     = require("./routes/shop"),
      errorRoutes    = require("./routes/errors"),
      loginRoutes    = require("./routes/authentication");



const options = {  
      useNewUrlParser:true,
      useUnifiedTopology:true,
      useCreateIndex:true,
      autoCreate:true,
      useFindAndModify:false,
      poolSize:10,
      serverSelectionTimeoutMS:0,
      socketTimeoutMS:0,
      family:4
};

const connectionUri = "mongodb://localhost:27017/FurnitureShop";

try{
      mongoose.connect(process.env.MONGODB_URL || connectionUri , options)
           .then( ()      =>   console.log("Połączono z bazą danych"))
           .catch( (err)  =>   console.log(`Problem z połączeniem z mongoose : ${err}`))
     
} catch (error) {
     throw new Error(error)
}

const mongoStore = new mongoDBSession({
     uri:process.env.MONGODB_URL || connectionUri,
     collection:"sessions"
});

require("./config/passport")(passport);

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
      destination:(req,file,cb) => {
           cb(null,"images");
      },
      filename:(req,file,cb) => {
            cb(null, file.filename + "-" + file.originalname)
      }
});

const fileFilter = (req,file,cb) => {

     if( file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg"){
          cb(null,true);
     } else {
          cb(null,false);
     }

}

app.use(bodyParser.urlencoded({extended:false}));
app.use(multer({dest:"images", storage:fileStorage, fileFilter: fileFilter}).single("image"));
app.use(express.static("public"));
app.use("/images", express.static("images"));
app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(session({
     secret:"In my opinion, Mr.Robot is the best series on the internet. I have watched a lot of series, but none of them was even half as good.",
     resave: true,
     saveUninitialized:false,
     store:mongoStore
}));

app.use(csrfProtection)
app.use((req,res,next) => {
     res.locals.isAuthenticated = req.user;
     res.locals.csrfToken       = req.csrfToken();
     next();
})

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req,res,next) => {
     res.locals.success_message = req.flash("successMsg"),
     res.locals.error_message   = req.flash("errorMsg"),
     res.locals.error           = req.flash("error")
     next()
})

app.use(indexRoutes);
app.use("/admin", adminRoutes);
app.use(shopRoutes);    
app.use(loginRoutes);
app.use(errorRoutes);


app.use( (error,req,res,next) => {

      res.status(500).render("errors/error-500", {
           title:"Wykryto błąd",
      })

      console.log(error)
})


const port = process.env.PORT || 3000

app.listen(port, () => console.log("Obsługiwanie na porcie " + port))