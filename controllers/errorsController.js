exports.get404 = (req,res,next) => {

     res.status(404).render("errors/error-404", {

         title      :"Nie znaleziono strony"

     })
}

exports.get500 = (req,res,next) => {

    res.status(500).render("error-500", {

         title:"Wystąpił błąd"

    });
}