var  stripe   = Stripe("pk_test_51GswerA4skDlzpwzJKRKeORlRb2JMjp2apeKa7NUdkUs6IlLJ9BrquOfvIlUC572WMYPLHX54Vu2MuMmfNzOE7Vj00IaxjxCHC"),
     orderBtn = document.getElementById("order-btn");

orderBtn.addEventListener("click", () => {

     stripe.redirectToCheckout({

      sessionId:"<%= session.Id %>"

     });
     
});