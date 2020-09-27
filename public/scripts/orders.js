const checkbox = () => {

     const checkboxhtml = document.getElementById("checkbox"),
           checkboxspan = document.getElementById("checkbox-span");

    console.log(checkboxspan.textContent)
        
    checkboxhtml.addEventListener("click", () => {
         if(checkboxspan.textContent === "") {
              checkboxspan.textContent = "Wysłane"
              console.log(":(")
         } else {
             checkboxspan.textContent = ""
             console.log(":((")
         }
    })


}

checkbox()