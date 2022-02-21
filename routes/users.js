const { response } = require("express");
const dotenv = require('dotenv')
var express = require("express");
const productHelpers = require("../Helpers/product-helpers");
var router = express.Router();
var ProductHelpers = require("../Helpers/product-helpers");
dotenv.config()
var userHelpers = require("../Helpers/user-helpers");
var client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOCKEN);

const AWS=require('aws-sdk')
const uuid=require('uuid')

const s3 = new AWS.S3({
  credentials: {
      accessKeyId: process.env.AWS_ID,
      secretAccessKey: process.env.AWS_SECRET,
  },
});

const paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AYdjMGuUF787WLH5V6EMGoSz6nT3HDrZtwKuI5SU8or93aFNR7iOrL_3vi-f4_7v2GpBO7I0rYARi3EF',
  'client_secret': 'ELNi2eafvFbWYfQMtdTeKDTwZVHkaE3ojUUatOv-QL-GK_gaGBoZqrL6yml8gQFXs8QWHZU6aOdMnPEc'
});
// session
let isSession = (req, res, next) => {
  if (req.session.logedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
/* GET home page. */
router.get("/", async function(req, res, next) {

  let cartCount=null;
  let wishlistCount=null;
  let total=null;
  console.log(req.session.user,"*********raziq hear***/-+");
  if(req.session.user){
    
     total=await userHelpers.checkoutTotal(req.session.user._id)

    cartCount= await ProductHelpers.getCartCount(req.session.user._id)
    wishlistCount= await ProductHelpers.getWishlistCount(req.session.user._id)

    console.log(cartCount);
}


  ProductHelpers.viewProducts().then(async(product) => {
    // let findoffer=await ProductHelpers.offerFind()
    // console.log(findoffer[0].categoryDetails.category);
    // let offerPro=await ProductHelpers.findOfferProduct(findoffer[0].categoryDetails.category)
    // console.log(findoffer);
   let banner=await ProductHelpers.bannerfind()
   let firstsmallbanner=await ProductHelpers.smallBannerfind1()
   let secondsmallbanner=await ProductHelpers.smallBannerfind2()
   let thirdsmallbanner=await ProductHelpers.smallBannerfind3()
   let fourthsmallbanner=await ProductHelpers.smallBannerfind4()

    let userlog = req.session.user;
   let categoryView=await ProductHelpers. categoryfind()
    res.render("users/index", { user: true, product,userlog,productResponse:req.session.productResponse,cartCount,total,banner,wishlistCount,categoryView,firstsmallbanner,secondsmallbanner,thirdsmallbanner,fourthsmallbanner});
  });
});
router.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    let err = req.session.logedInBlock;
    let otploginEr=req.session.otpLoginErr;
    let loginStatus= req.session.logedInstatusErr
    res.render("users/login", {userlog:true ,err,otploginEr,loginStatus});
    req.session.logedInBlock = null;
    req.session.otpLoginErr=null;
    req.session.logedInstatusErr=null;
  }
});
router.get("/signup", (req, res) => {
  let userlog=null;
  req.session.logedIn=false;
  if (req.session.logedIn) {
    userlog = req.session.response;
    res.redirect("/");
  } else {
    let confirmerr = req.session.confirmErr;
    let existotp = req.session.exist;
    let otpErr = req.session.otpErr;

    res.render("users/signup", {userlog:true, otpErr, existotp, confirmerr });
    req.session.confirmErr = null;
  }
});

router.get("/login-otp", (req, res) => {
  let sighnupotpErr = req.session.sighnUpcodeErr;
  res.render("users/loginSignup-otp", {userlog:true, sighnupotpErr });
});


router.get('/submitotp',(req,res)=>{
  res.render('users/loginSignup-otp',{userlog:true,sighnUpcodeErr:req.session.sighnUpcodeErr})
})
// send otp signup
router.post("/submitotp", async (req, res) => {
  
  if (req.body.password == req.body.confirm) {
    let response = await userHelpers.doSignup(req.body);
    
    if (!response) {
      
      req.session.name = req.body.name;
      req.session.phone = req.body.phone;
      req.session.password = req.body.password;
      req.session.email = req.body.email;
      req.session.address = req.body.address;
      req.session.phone = req.body.phone;
      console.log('hello boys');
      client.verify
      .services(process.env.SERVICE_ID)
      .verifications.create({
        to: `+91${req.session.phone}`,
        channel: "sms",
        
      })
      
      .then((response) => {
        
        
        if (response.status === "pending") {
          
          res.redirect("/login-otp");
        } else {
            req.session.otpErr = "otp messege sending failed please try again";
            res.redirect("/signup");
          }
        });
    } else {
      req.session.exist = "Already user exist";
      res.redirect("/signup");
    }
  } else {
    req.session.confirmErr = "doesn't match password";
    res.redirect("/signup");
  }
});

// verify otp signup
router.post("/signup", (req, res) => {
  console.log("signup hello");
  const otp = req.body.otp;
  try {
    client.verify
      .services(process.env.SERVICE_ID)
      .verificationChecks.create({
        to: `+91${req.session.phone}`,
        code: otp,
      })
      .then(async(result) => {
        if (result.status === "approved") {
          let userData = {
            name: req.session.name,
            phone: req.session.phone,
            password: req.session.password,
            email: req.session.email,
            address: req.session.address, 
          };
          let response= await userHelpers.doSuccess(userData)
          let id=response.insertedId
          let userSession=await userHelpers.findUser(id)
          console.log("userSession",userSession);
          req.session.user=userSession
          req.session.logedIn=true
            res.redirect("/");

        } else {  
          req.session.sighnUpcodeErr = "incorrect otp";
          res.redirect("/submitotp");
        }
      });
  } catch (err) {
    req.session.sighnUpcodeErr = "incorrect otp";
    res.redirect("/submitotp");
  }
});

///resend-signup-otp-start
//send Otp
router.get("/resend-signup-otp", (req, res) => {
  console.log("signup hello");
  client.verify
  .services(process.env.SERVICE_ID)
  .verifications.create({
    to: `+91${req.session.phone}`,
    channel: "sms",
    
  })
  
  .then((response) => {
    console.log(req.body);
    
    if (response.status === "pending") {
      
      res.redirect("/login-otp");
    } else {
        req.session.otpErr = "otp messege sending failed please try again";
        res.redirect("/signup");
      }
    });
});

//get Otp-submitOtp
router.post("/resend-signup-otp", (req, res) => {
  console.log("signup get Otp");
  const otp = req.body.otp;
  try {
    client.verify
      .services(process.env.SERVICE_ID)
      .verificationChecks.create({
        to: `+91${req.session.phone}`,
        code: otp,
      })
      .then((result) => {
        if (result.status === "approved") {
          let userData = {
            name: req.session.name,
            phone: req.session.phone,
            password: req.session.password,
            email: req.session.email,
            address: req.session.address, 
          };
          userHelpers.doSuccess(userData).then(async(response) => {
            let id=response.insertedId
            let userSession=await userHelpers.findUser(id)
            console.log("userSession",userSession);
            req.session.user=userSession
            console.log("njan responsasa...............",response);
            res.redirect("/");
          });
        } else {  
          req.session.sighnUpcodeErr = "incorrect otp";
          res.redirect("/submitotp");
        }
      });
  } catch (err) {
    req.session.sighnUpcodeErr = "incorrect otp";
    res.redirect("/submitotp");
  }
});

///resend-signup-otp-end


router.post("/login",async(req, res) => {
        userHelpers.doLoginsuccess(req.body).then((response) => {
        if(response.isblock || response.isblock==null){

          if (response.status) {
            console.log("njan phonee ", response.user.phone);

            req.session.logedIn = true;
            req.session.user = response.user;
            res.redirect('/')
          } else {
            req.session.logedInstatusErr ="this user is not register" ;
            res.redirect("/login");
          }
        }else{
          req.session.logedInBlock ="admin blocked this user" ;
            res.redirect("/login");
        }
        
        });
  
});
// user logout
router.get("/logout", (req, res) => {
  
  req.session.user = null;
  res.redirect("/");
});


// login otp veryfication
router.get('/user-otp',(req,res)=>{
  let otpnumErr=req.session.otpNumberErr
  let otpErr=req.session.otpErr
  res.render('users/user-otp-number',{userlog:true,otpnumErr,otpErr})
});

router.get('/user-otp-login',(req,res)=>{

  res.render('users/user-otp-login',{userlog:true,sighnUpcodeErruser:req.session.sighnUpcodeErruser})
});


router.post('/userVeryfication',(req,res)=>{
  console.log("njan req.body",  req.body.phone);
  req.session.phone=req.body.phone;
userHelpers.otpVeryfication(req.body.phone).then((response)=>{
  console.log(response);
  console.log(response.status);
  if(response.status){
    req.session.user=response.user
    client.verify
        .services(process.env.SERVICE_ID)
        .verifications.create({
          to: `+91${req.session.phone}`,
          channel: "sms",
        })
       .then((response) => {
          if (response.status === "pending") {
            res.redirect("/user-otp-login");
          } else {
            req.session.otpErr = "otp messege sending failed please try again";
            res.redirect("/login-otp");
          }
        });
  }else{
    req.session.otpNumberErr="this number not register"
    res.redirect("/user-otp")
  }

})
});

router.post('/otpLoginVeryfication',(req,res)=>{
console.log(req.session.user);
  const otp = req.body.otp;
  try {
    client.verify
      .services(process.env.SERVICE_ID)
      .verificationChecks.create({
        to: `+91${req.session.user.phone}`,
        code: otp,
      }).then((result) => {
        if (result.status === "approved") {
          res.redirect('/')
    }else{
      
      res.redirect('/user-otp-login')
    }
  })
}catch (err) {
  req.session.sighnUpcodeErruser = "incorrect otp";
  res.redirect("/login-otp");
}
});


///resend-send-login-Otp
router.get('/resend-login-otp',(req,res)=>{
  console.log("hello guys I am a resend");
   client.verify
        .services(process.env.SERVICE_ID)
        .verifications.create({
          to: `+91${req.session.phone}`,
          channel: "sms",
        })
       .then((response) => {
          if (response.status === "pending") {
            res.redirect("/user-otp-login");
          } else {
            req.session.otpErr = "otp messege sending failed please try again";
            res.redirect("/login-otp");
          }
})
})

// otp-end



//product details

router.get('/productDetails/',(req,res)=>{
  console.log("njan ivde ethi");
  ProductHelpers.productDetails(req.query.id).then((productResponse)=>{
    res.render('users/product-details/product-details',{user:true,productResponse})
    // console.log(req.files);
    // let image =req.files.image;
    // image.mv('./public/product-image/'+req.query.id+".png")
  })
});


 
// shopping
//  router.get('/shopping',(req,res)=>{
//    console.log("hello");
//    res.render('users/shopping/shopping',{user:true})
//  });

//  add-to-cart
router.get('/showCart',isSession,async(req,res)=>{
  console.log("************",req.session.user);
 let response=await userHelpers.CollectionCart(req.session.user._id)
 let totalValue=await userHelpers.checkoutTotal(req.session.user._id)
 let SubTotal=await userHelpers.checkoutSubtotal(req.session.user._id)

    res.render('users/shopping/addToCart',{user:true,userlog:req.session.user,response,user:req.session.user._id,totalValue,SubTotal})
  
})
 
router.get('/addtocart/:id',isSession,(req,res)=>{
  console.log("njan add to cart");
  let userId=req.session.user;
  console.log(userId);
  userHelpers.addToCart(req.params.id,userId._id).then(()=>{
    console.log("hello cart");
   res.json({status:true})
  })
});
//addtowishlist
router.get('/addtowishlist/:id',isSession,async(req,res)=>{
  let userId=req.session.user;
console.log(req.params.id,"/***9*996638*965*969**--*-/");
 let result=await userHelpers.addToWshlist(req.params.id,req.session.user._id)
 if(result.productExist){
  res.json({productExist:true})
 }else{
   res.json({status:true})
 }


})
router.post('/change-product-quantity',(req,res)=>{
  console.log("req.body",req.body);
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    
    response.SubTotal=await userHelpers.checkoutChangeSubtotal(req.body.user)
    response.total=await userHelpers.checkoutTotal(req.body.user)

    res.json(response)
  })
});
router.post('/remove-cart',(req,res)=>{
  userHelpers.removeCart(req.body).then((response)=>{
    res.json(response)
  })
});

// chekcout
router.get('/checkout',isSession,async(req,res)=>{
  console.log("hello checkkout");
 let total=await userHelpers.checkoutTotal(req.session.user._id)
 let adress=await userHelpers.findAddress(req.session.user._id)
 let couponDiscountPrice=req.session.couponDiscountPrice
 let couponTrue=req.session.couponTrue
//  let couponExist=req.session.couponExist
 let noCoupon=req.session.noCoupon
 let coupons=await ProductHelpers.showCoupon()
 res.render('users/shopping/checkout',{user:true,total,userlog:req.session.user,user:req.session.user,adress,couponDiscountPrice,couponTrue,noCoupon,coupons})
//  req.session.couponExist=null
 req.session.noCoupon=null
});
router.post('/place-order',async(req,res)=>{
  console.log(req.body);
  let product =await userHelpers.getCartProduct(req.body.userId)
 let totalPrice=await userHelpers.checkoutTotal(req.body.userId)
 console.log("totalPrice",totalPrice);
 console.log("req.body",req.body);
 console.log("product",product);

 if(req.session.couponTrue){
  totalPrice=req.session.couponDiscountPrice
 }

 userHelpers.placeOrder(req.body,product,totalPrice).then(async(orderId)=>{
  req.session.orderId=orderId
   if(req.body['pay-method']=="COD"){
     userHelpers.deleteCart(req.body)
     await userHelpers.couponCodeExist(req.session.user._id,req.session.coupunCode,req.session.couponDiscountPrice)
     await  userHelpers.decrementproduct(req.session.user._id,req.session.orderId)
        req.session.couponDiscountPrice=null
        req.session.couponTrue=null
     res.json({codSuccess:true})
   }else if(req.body['pay-method']=="razorPay"){
   
    userHelpers.generateRazorPay(orderId,totalPrice,req.session.user._id,req.session.couponTrue,req.session.couponDiscountPrice).then(async(response)=>{
      await userHelpers.couponCodeExist(req.session.user._id,req.session.coupunCode,req.session.couponDiscountPrice)
      
        req.session.couponDiscountPrice=null
        req.session.couponTrue=null
      res.json(response)
    })
   }
else if(req.body['pay-method']=='paypal'){
  req.session.orderId=orderId
  console.log("*****/***//879896245");
  res.json({paypalstatus:true})
   }
 })
})
//paypal start
router.get('/pay', async(req, res) => {
  if(req.session.couponTrue){
    var indtotal=req.session.couponDiscountPrice/75
    indtotal=parseInt(indtotal) 
    console.log(indtotal);
  }else{
    var total=await userHelpers.checkoutTotal(req.session.user._id)
    var indtotal=total.total/75
    indtotal=parseInt(indtotal)
    console.log(indtotal);
  }


  req.session.indtotal=indtotal
  const create_payment_json = {
    "intent": "sale", 
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://www.zahraf.online/success",
        "cancel_url": "http://www.zahraf.online/cancel"
    },
    "transactions": [{ 
        "item_list": {
            "items": [{
                "name": "zahraf Products",
                "sku": "001",
                "price": indtotal,
                "currency": "USD",
                "quantity": 1
            }] 
        },
        "amount": {
            "currency": "USD",
            "total": indtotal
        },
        "description": "Product for the best team ever"
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
    console.log(error);
      throw error;
  } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
  } 
}); 

});
router.get('/success', async(req, res) => {
  let indtotal=req.session.indtotal 
  let total=await userHelpers.checkoutTotal(req.session.user._id)
  total=total/75
  console.log('errrorrrrrrrrrr');
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": indtotal
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json,async function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
     let order=await userHelpers.orderIdPick(req.session.orderId)
     console.log("Razi m......r.r.r.r.r.r",order._id);
     userHelpers.changePaymentStatus(order._id,req.session.user._id)
      userHelpers.deleteCart(order)
        console.log(JSON.stringify(payment));
       await userHelpers.couponCodeExist(req.session.user._id,req.session.coupunCode,req.session.couponDiscountPrice)
       await  userHelpers.decrementproduct(req.session.user._id,req.session.orderId)
        req.session.couponDiscountPrice=null
        req.session.couponTrue=null
        res.redirect('/order-sucess');
    }
});
});
router.get('/cancel', (req, res) => res.send('Cancelled'));
//paypal end
router.get('/address',(req,res)=>{
  let userlog = req.session.user;
  res.render('users/shopping/user-address',{user:true,userlog})
});
router.post('/add-addres',(req,res)=>{
  console.log(req.body);
  userHelpers.addAddress(req.body,req.session.user._id).then((result)=>{
    console.log(result);
    res.redirect('/myprofile')
  })
});
router.post('/add-address',(req,res)=>{
  console.log(req.body);
  userHelpers.addAddress(req.body,req.session.user._id).then((result)=>{
    console.log(result);
    res.redirect('/checkout')
  })
});
router.get('/order-sucess',isSession,(req,res)=>{
  let userlog = req.session.user;
  res.render('users/shopping/order-success',{user:true})
  
});

router.get('/product-details',isSession,async(req,res)=>{
  let userlog = req.session.user;
  let orders=await userHelpers.showOrderDetails(req.session.user._id)
res.render('users/shopping/view-order-products',{user:true,orders,userlog})
  
});

router.post('/cancelProOrder',isSession,(req,res)=>{
  userHelpers.cancelOrder(req.body.orderId,req.body.orderProId,req.session.user._id)
});
router.post('/viewProOrder',isSession,async(req,res)=>{
 let viewPro =await userHelpers.viewProOrder(req.body.orderId,req.body.orderProId,req.session.user._id)
 req.session.viewPro=viewPro
 res.json({status:true})
})
router.get('/viewProOrder',isSession,async(req,res)=>{
  // let viewPro =await userHelpers.viewProOrder(req.body.orderId,req.body.orderProId,req.session.user._id)
  res.render('users/shopping/single-Product-details',{user:true,userlog:req.session.user,viewPro:req.session.viewPro})

 })
//razorpay
router.post('/verify-payment',(req,res)=>{
  console.log("465465/**/*/*/*/*/*/*/*/",req.body);
  userHelpers.verifyPayment(req.body).then((reponse)=>{
    
    userHelpers.changePaymentStatus(req.body['order[receipt]'],req.session.user._id).then(async(result)=>{
      await  userHelpers.decrementproduct(req.session.user._id,req.session.orderId)
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:""})
  })
})
    //user-profile
router.get("/myprofile",isSession,async(req, res) => {
  let adress=await userHelpers.findAddress(req.session.user._id)
  let getUser= await userHelpers.viewUserProfile(req.session.user._id)
  console.log("$match/*/*/*",adress);
  let image=false
  if(req.session.files){

    image=req.session.files
  }
 res.render("users/user-profile/user-profile-edit", {userlog:req.session.user, user: true,getUser,adress,image});
  });
  router.get("/edit-userProfile",isSession,async(req,res)=>{
  let getUser= await userHelpers.viewUserProfile(req.session.user._id)
    res.render('users/user-profile/editUserProfile',{userlog:req.session.user, user: true,getUser})
  })  
  router.post('/submit-editPro',isSession,async(req,res)=>{
    let usersuccedit=await userHelpers.updateUser(req.session.user._id,req.body)
   let files;
    if(req.files){
      req.session.files=true
    }else{
      req.session.files=false
    }
    res.redirect('/myprofile')
    let myrproimage =req.files.myrproimage;
    try{
      console.log("*****in try params");
      const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.session.user._id+".png",
      Body: myrproimage.data
      }
      console.log(params,"/*****");
      s3.upload(params,(err,data)=>{
      if (err) {
      console.log("erererererrrrrrrrrr",err);
      
       }else{
         console.log("daTaaaaaaaaaaaaa",data);
       }
      })
      }catch (error){
      console.log(error);
      console.log("************in catch error");
      
      }
    // myrproimage.mv('./public/Profile-image/'+req.session.user._id+".png")

  })
  router.get('/change-password',isSession,(req,res)=>{
    res.render('users/user-profile/change=password',{userlog:req.session.user,user: true,passErr:req.session.passErr,oldPass:req.session.oldPass})
    req.session.passErr=null;
    req.session.oldPass=null;
  });
  router.post('/changed-password',isSession,async(req,res)=>{
    console.log(req.body)
    if(req.body.newPass===req.body.conf){
      let isUser=await userHelpers.changedPassword(req.body,req.session.user._id)
      if(isUser.status){
        res.redirect('/myprofile')
      }else{
        req.session.oldPass='You Entered Wrong Old Password'
       res.redirect('/change-password')
        
      }
    }else{
      req.session.passErr='password dosent match'
      res.redirect('/change-password')
    }
  })
  //wishlist  
  router.get('/wishlist',isSession,async(req,res)=>{
    let wishlistPro=await userHelpers.CollectionWishlist(req.session.user._id)
    console.log("789664*/-+",wishlistPro);
    res.render('users/shopping/wishlist',{user:true,wishlistPro,userlog:req.session.user})
  })
  router.post('/remove-wishlist',(req,res)=>{
    console.log('hellloloolio shibuuuuuuuuuuuuuuuuuuuu/*98+9');
    userHelpers.removeWishlist(req.body).then((response)=>{
      res.json(response)
    })
  })
  router.get('/editAdress',isSession,async(req,res)=>{
    console.log(req.query.id);
    let Address=await userHelpers.editAddress(req.query.id)
    console.log(Address);
    res.render('users/user-profile/edit-address',{user:true,userlog:req.session.user,Address})
  });
  router.post('/edit-addres',async(req,res)=>{
    console.log(req.body);
   let response=await userHelpers.modifyAddress(req.body)
   res.redirect('/myprofile')
  });
  //coupon
  router.post('/applycoupon',isSession,async(req,res)=>{
    console.log(req.body.coupunCode);
    console.log(req.session.user);
    let chechcoupon= await userHelpers.chechCoupon(req.body.coupunCode,req.session.user._id)
    if(chechcoupon){
      let discount= chechcoupon.discount  
      let couponDiscountPrice= await userHelpers.getCoupon(req.body.coupunCode,req.session.user._id,discount)
      console.log("******8943512209",couponDiscountPrice);
   let couponExist=await userHelpers.checkcCouponExist(req.body.coupunCode,req.session.user._id,couponDiscountPrice)
      
  //  console.log("couponExit//**/",couponExist);
      if(couponExist.status){
        // req.session.couponExist="Coupon Already Applied"
        // res.redirect('/checkout')
        res.json({status:true})
      }else{
        req.session.coupunCode=req.body.coupunCode
        console.log("hello");
        req.session.couponDiscountPrice=couponDiscountPrice;
        req.session.couponTrue=true
        // res.redirect('/checkout')
        res.json({couponDiscountPrice})

      }

    }else{
      req.session.noCoupon="No Discount for This Coupon"
      res.redirect('/checkout')
    }
  });
   
  router.get('/coupon-apply',async(req,res)=>{
    let coupons=await ProductHelpers.showCoupon()
    console.log(coupons);
  res.render('users/offer/couponOffer',{user:true,userlog:req.session.user,coupons})
  })
//search
router.post('/search',(req,res)=>{
  console.log(req.body); 
  userHelpers.searchProduct(req.body.content).then(async(showPro)=>{
   let viewPro=await ProductHelpers.viewProducts()
    res.render('users/shopping/shopping',{user:true,showPro,userlog:req.session.user,viewPro})
  })
});
router.get('/showCategoryPro/',async(req,res)=>{
  console.log(req.query.id);
  var product;
    if(req.session.sort){
      req.session.sort=false
      product= req.session.viewPro
    }else if(req.session.pricesort){
      req.session.pricesort=false
      product=req.session.textsort
      console.log(product);


    }else{
      product=await userHelpers.findCategoryPro(req.query.id)
    }
    let viewPro=await ProductHelpers.viewProducts()
    res.render('users/shopping/product-parchase',{user:true,userlog:req.session.user,product,viewPro})
 
});

router.get('/alphaSort',async(req,res)=>{
  let viewPro=await userHelpers.findSortPro()
  req.session.sort=true
  req.session.viewPro=viewPro
  res.redirect('/showCategoryPro')
});
router.get('/textSort',async(req,res)=>{
  console.log('hello guys');
  let viewPro=await userHelpers.PriceSort()
  req.session.textsort=viewPro
  req.session.pricesort=true
  res.redirect('/showCategoryPro')
})
//filter
// router.post('/priceFilter',(req,res)=>{
//   console.log("*****priceFilter***",req.body)
//   user
// })
module.exports = router;
