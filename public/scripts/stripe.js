const  stripe   = Stripe("stripe_key_goes_here"),
       orderBtn = document.getElementById("order-btn");

orderBtn.addEventListener("click", () => {

     stripe.redirectToCheckout({

      sessionId:"<%= session.Id %>"

     });
     
});
