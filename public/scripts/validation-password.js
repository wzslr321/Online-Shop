const passwordValidation = () => {

    const password        = document.getElementById("password").value,
          passwordInput   = document.getElementById("password"),
          confirmPassword = document.getElementById("confirmPassword").value,
          confPswdInput   = document.getElementById("confirmPassword");

const passwordLength = () => {

    if(password.length < 8){
           passwordInput.classList.add("invalid")
           passwordInput.classList.remove("valid")
    } else {
           passwordInput.classList.add("valid")
           passwordInput.classList.remove("invalid")
    }

}


const passwordEqual =  ()  =>  {

    if(password !== confirmPassword) {
           confPswdInput.classList.add("invalid")
           confPswdInput.classList.remove("valid")
    } else {
           confPswdInput.classList.add("valid")
           confPswdInput.classList.remove("invalid")
    }

}   

passwordValidation.passwordLength   = passwordLength;
passwordValidation.passwordEqual    = passwordEqual;

}
