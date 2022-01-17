const { response } = require("express");
var express = require("express");
const productHelpers = require("../Helpers/product-helpers");
var router = express.Router();
var ProductHelpers = require("../Helpers/product-helpers");
var userHelpers = require("../Helpers/user-helpers");
var serviseSID = "VA36fa120a3c7a3e7398782d574b5abf16";
var accountSID = "AC004073380f5c23a606371bbbc0e1fc3e";
var authTocken = "ccb4cb4ab95e2ffb0938038dc2958b74";
var client = require("twilio")(accountSID, authTocken);
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
  let total=null;
  if(req.session.user){
    
     total=await userHelpers.checkoutTotal(req.session.user._id)

    cartCount= await ProductHelpers.getCartCount(req.session.user._id)
    console.log(cartCount);
}


  ProductHelpers.viewProducts().then((product) => {
    let userlog = req.session.user;
    res.render("users/index", { user: true, product,userlog,productResponse:req.session.productResponse,cartCount,total});
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

      client.verify
        .services(serviseSID)
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
  const otp = req.body.otp;
  try {
    client.verify
      .services(serviseSID)
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
          console.log(userData);
          userHelpers.doSuccess(userData).then((response) => {
            console.log("njan responsasa...............",response);
            req.session.user = userData;
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
        .services(serviseSID)
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
      .services(serviseSID)
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
// otp-end



//product details

router.get('/productDetails/',(req,res)=>{
  console.log("njan ivde ethi");
  ProductHelpers.productDetails(req.query.id).then((productResponse)=>{
    res.render('users/product-details/product-details',{user:true,productResponse})
    let image =req.files.image
    image.mv('./public/product-image/'+req.query.id+".png")
  })
});

// user-profile Edit
// router.get("/user-edit/",(req, res) => {
//   userHelpers.editUser(req.query.id).then((responseId)=>{
//     console.log(responseId);
//     res.render("admin/user-managment/user-edit", {responseId, admin: true});
//   })
//   });
//   router.post('/edit-user/',(req,res)=>{
//     userHelpers.updateUser(req.query.id,req.body)
//   })
 
// shopping
 router.get('/shopping',(req,res)=>{
   console.log("hello");
   res.render('users/shopping/shopping',{user:true})
 });

//  add-to-cart
router.get('/showCart',isSession,async(req,res)=>{
 let response=await userHelpers.CollectionCart(req.session.user._id)
    let totalValue=await userHelpers.checkoutTotal(req.session.user._id)
    console.log(response);
    res.render('users/shopping/addToCart',{user:true,response,user:req.session.user._id,totalValue})
  
})

router.get('/addtocart/:id',(req,res)=>{
  console.log("hi");
  let userId=req.session.user;
  console.log(userId);
  userHelpers.addToCart(req.params.id,userId._id).then(()=>{
    console.log("hello cart");
   res.json({status:true})
  })
});
router.post('/change-product-quantity',(req,res)=>{
  console.log("req.body",req.body);
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
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
 let adress=await userHelpers.findAddress()
 res.render('users/shopping/checkout',{user:true,total,user:req.session.user,adress})

});
router.post('/place-order',async(req,res)=>{
  let product =await userHelpers.getCartProduct(req.body.userId)
 let totalPrice=await userHelpers.checkoutTotal(req.body.userId)
 userHelpers.placeOrder(req.body,product,totalPrice).then((result)=>{
   res.json({status:true})
 })
  console.log(req.body);
});

router.get('/address',(req,res)=>{
  res.render('users/shopping/user-address',{user:true})
});
router.post('/add-addres',(req,res)=>{
  console.log(req.body);
  userHelpers.addAddress(req.body).then((result)=>{
    console.log(result);
    res.redirect('/address')
  })
});

router.get('/order-sucess',(req,res)=>{
  res.render('users/shopping/order-success',{user:true})
});

router.get('/product-details',isSession,async(req,res)=>{
  console.log("njan  /product-details");
  let orders=await userHelpers.showOrderDetails(req.session.user._id)
  console.log(orders);
res.render('users/shopping/view-order-products',{user:true,orders})
  
})



      
module.exports = router;