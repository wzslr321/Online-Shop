const categoryScript = () => {

     const products = document.getElementById("products"),
           category = document.querySelectorAll("li"),
           sidebar  = document.getElementById("sidebar")

     products.addEventListener("click", () => {

        for(let i = 0; i < category.length; i++){

         if(category[i].classList.contains("category-display")){
             
                category[i].classList.remove("category-display")
       
           
         } else {
           
                category[i].classList.add("category-display")
             
         }
 
        }

     }) 

}

categoryScript()