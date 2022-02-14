function addToCart(proId){
    $.ajax({
        url:'/addtocart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$("#cart-count").html()
                count=parseInt(count)+1
                $("#cart-count").html(count)
            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
    }
})
};
function addToWishlist(proId){
  $.ajax({
      url:'/addtowishlist/'+proId,
      method:'get',
      success:(response)=>{
        if(response.productExist){
          alert('Product already exist')
        }else{
              let wcount=$("#wishlist-count").html()
              wcount=parseInt(wcount)+1
              $("#wishlist-count").html(wcount)
          }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
  }
})
};

$('#checkout-form').submit((e)=>{  
		e.preventDefault()
    $.ajax({
      url:'/place-order',
      method:'post',
      data:$('#checkout-form').serialize(),
      success:(response)=>{
        if(response.codSuccess){
          location.href='/order-sucess'
        }else if(response.paypalstatus){
          location.href='/pay'
        }
        else{
          console.log("else");
          razorpayPayment(response)
        }
      }
    })

	});

  function razorpayPayment(order){
    console.log("5456546",order);  
    var options = {
      "key": "rzp_test_QfBZTvTbLNn14a", // Enter the Key ID generated from the Dashboard
      "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      "currency": "INR",
      "name": "zahraf",
      "description": "Test Transaction",
      "image": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fdribbble.com%2Fshots%2F15943589-Arabic-logo-zahra&psig=AOvVaw0U_PZ4uPeVQMxQfDrjGupv&ust=1643445696138000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCLDH6MWG1PUCFQAAAAAdAAAAABAD",
      "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      "handler": function (response){
         
          verifyPayment(response,order)
      },
      "prefill": {
          "name": "Gaurav Kumar",
          "email": "gaurav.kumar@example.com",
          "contact": "9999999999"
      },
      "notes": {
          "address": "Razorpay Corporate Office"
      },
      "theme": {
          "color": "#3399cc"
      }
  };
  var rzp1 = new Razorpay(options);
  rzp1.open();
  };

  function verifyPayment(payment,order){
 console.log("veryfication");
 console.log("veryfication");
 console.log("veryfication");
 $.ajax({
      url:'/verify-payment',
      data:{payment,order},
      method:'post',
      success:(response)=>{
        if(response.status){
        let con=  swal(
            'Good job!',
            'Your payment!',
            'success'
          ).then(()=>{
            location.href='/order-sucess' 

          })
          

          
        }else{
          swal(
            'Oops...',
            'Something went wrong!',
            'Payment Failed'
          )
        }
      }
    }) 

  }
  
  $(document).ready(function() {
    $('#example').DataTable( {
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ]
    } );
} );