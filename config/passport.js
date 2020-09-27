const { response } = require("express");

const LocalStrategy      = require("passport-local").Strategy,
      bcrypt             = require("bcryptjs"),
      User               = require("../models/user");


/* ============  LOGIN FUNCTIONALITY ============ */  


module.exports = passport => {

    passport.use("local-login", new LocalStrategy({usernameField:"email"}, 

        (email,password,done) => {


            User.findOne({email:email})
                .then(user => {

                    if(!user){
                         return done(null,false, { message:"Niepoprawny e-mail lub hasło" })
                    }

                    bcrypt.compare(password, user.password, (error, isMatch) => {

                        const isVerified = user.isVerified
                        
                        if(error) throw error

                        else if(isVerified === false){
                               return done(null,false,{message:"Zweryfikuj konto aby się zalogować"})
                        }

                         else if(isMatch ) {
                             return done(null,user)
                        } else {
                             return done(null,false,{message:"Niepoprawny e-mail lub hasło"})
                        }
                     });
                })

                .catch(err => {

                     console.log(err);

                     const error = new Error(err);
                           error.httpStatusCode = 500;

                      return next(error);

                })
        })
    );

passport.serializeUser( (user,done) => done(null,user.id) )

passport.deserializeUser( (id,done) => User.findById(id, (error,user) => done(error,user) ))


}


