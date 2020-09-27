const emailValidation = () => {

    const    form            = document.getElementById("form"),
             email           = document.getElementById("email").value,
             emailInput      = document.getElementById("email"),
             pattern         =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const emailCheck = () =>  {

        if (email.match(pattern)){
             emailInput.classList.add   ("valid");
             emailInput.classList.remove("invalid");
        } else {
             emailInput.classList.remove("valid");
             emailInput.classList.add   ("invalid");
        }

    }

    emailValidation.email = emailCheck;
   
}
