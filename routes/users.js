const { response } = require("express");
var express = require("express");
const productHelpers = require("../Helpers/product-helpers");
var router = express.Router();
var ProductHelpers = require("../Helpers/product-helpers");
var userHelpers = require("../Helpers/user-helpers");
var serviseSID = "VAf911e28a16ad3b06e7ca26e20a016a82";
var accountSID = "AC004073380f5c23a606371bbbc0e1fc3e";
var authTocken = "fb7d5608ea7d7b2874d914fc5bb103f9";
var client = require("twilio")(accountSID, authTocken);
let isSession = (req, res, next) => {
  if (req.session.logedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
/* GET home page. */
router.get("/", function (req, res, next) {
  productHelpers.viewProducts().then((product) => {
    let userlog = req.session.user;
    console.log(userlog);
    res.render("users/index", { user: true, product,userlog });
  });
});
router.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    let err = req.session.logedInBlock;
    let otploginEr=req.session.otpLoginErr;
    let loginStatus= req.session.logedInstatusErr
    res.render("users/login", { err,otploginEr,loginStatus});
    req.session.logedInBlock = null;
    req.session.otpLoginErr=null;
    req.session.logedInstatusErr=null;
  }
});
router.get("/signup", (req, res) => {
  if (req.session.logedIn) {
    let userlog = req.session.response;
    res.redirect("/");
  } else {
    let confirmerr = req.session.confirmErr;
    let existotp = req.session.exist;
    let otpErr = req.session.otpErr;

    res.render("users/signup", { otpErr, existotp, confirmerr });
    req.session.confirmErr = null;
  }
});

router.get("/login-otp", (req, res) => {
  let sighnupotpErr = req.session.sighnUpcodeErr;
  res.render("users/loginSignup-otp", { sighnupotpErr });
});

// send otp signup
router.post("/submitotp", async (req, res) => {
  console.log(req.body);

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
          console.log("njan approved ayi");
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
            req.session.user = response;
            res.redirect("/");
          });
        } else {
          req.session.sighnUpcodeErr = "incorrect otp";
          res.redirect("user/login");
        }
      });
  } catch (err) {
    req.session.sighnUpcodeErr = "incorrect otp";
    res.redirect("user/login");
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
          req.session.logedInBlock ="admin block this user" ;
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
  res.render('users/user-otp-number',{otpnumErr,otpErr})
});

router.get('/user-otp-login',(req,res)=>{
  res.render('users/user-otp-login')
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
          console.log("njan approved ayi");
          res.redirect('/')
    }else{
      
      res.redirect('/user-otp-login')
    }
  })
}catch (err) {
  req.session.sighnUpcodeErr = "incorrect otp";
  res.redirect("user/login-otp");
}
});


//product details

router.get('/productDetails',(req,res)=>{
  res.render('users/product-details/product-details')
})



      
module.exports = router;