const { response } = require("express");
var express = require("express");
var router = express.Router();
var ProductHelpers = require("../Helpers/product-helpers");
const userHelpers = require("../Helpers/user-helpers");

// admin session
let isSession = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/admin/admin-login");
  }
};
/* GET users listing. */
router.get("/", function (req, res, next) {
  if(req.session.loggedIn){
    res.render("admin/index", { admin: true });
  }else{
    res.redirect('/admin/admin-login')
  }
  
  
});
// admin login
router.get('/adminlogin',(req,res)=>{
  if(req.session.loggedIn){
    res.render("admin/index", { admin: true });
  }else{
    res.redirect('/admin/admin-login')
  }
});
router.get('/admin-login',(req,res)=>{
let err = req.session.LoggedErr
  res.render('admin/admin-login',{admin: true,err})
});

router.post('/admin-login',(req,res)=>{
  let admin="raziqsur@gmail.com";
  let password=12345;
  let namAdmin=req.body.email ;
  let passAdmin=req.body.password;
  if(admin==namAdmin && password==passAdmin){
    req.session.loggedIn=true;
    res.redirect('/admin/')
  }else{
  req.session.Loggedin=false;
  req.session.LoggedErr="invalid password";
  res.redirect('/admin/admin-login')
  }
});

router.get('/logout',(req,res)=>{
  req.session.loggedIn=false
  res.redirect('/admin/admin-login')
})

// product-Mangment
router.get("/product-manage",isSession, (req, res) => {
  ProductHelpers.viewProducts().then((product) => {
    res.render("admin/product-managment/view-product", {
      admin: true,
      product,
    });
  });
});
router.get("/add-poduct", isSession,(req, res) => {
  ProductHelpers.categoryfind().then((response)=>{
    
    res.render("admin/product-managment/add-product", { admin: true,response });
  })
});
router.post("/add-product", (req, res) => {
  ProductHelpers.addProduct(req.body).then((id) => {
    let image = req.files.image;
    let image1 = req.files.image1;
    let image2 = req.files.image2;

    image.mv("./public/product-image/" + id.insertedId+"image"+".png", (err) => {
      if (!err) {
        image1.mv("./public/product-image/"+id.insertedId+"image1"+".png",(err)=>{
          console.log("njan "+image1);
          if(!err){
            image2.mv("./public/product-image/"+id.insertedId+"image2"+".png",(err)=>{
              console.log("njan "+image1);
              if(!err){
                res.redirect("/admin/product-manage");             }
            })
          }
        })
      }
    })
  });
});

router.get("/delete-product/", (req, res) => {
  let id = req.query.id;
  console.log(id);
  ProductHelpers.deleteProduct(id).then((response) => {
    console.log("helloo njan ethi.........................ivide");
    res.redirect("/admin/product-manage");
  });
});
router.get("/edit-products/", (req, res) => {
  let editproid = req.query.id;
  ProductHelpers.editProduct(editproid).then((editResponse) => {
    console.log(editResponse);
    res.render("admin/product-managment/edit-product", {
      admin: true,
      editResponse,
    });
  });
});

router.post("/update-product/", (req, res) => {
  ProductHelpers.updateProduct(req.query.id, req.body).then((response) => {
    res.redirect("/admin/product-manage");
    if (req.files.image) {
      let image = req.files.image;
      let image1 = req.files.image1;
      let image2 = req.files.image2;

      image.mv("./public/product-image/" + req.query.id +"image"+".png");
      image1.mv("./public/product-image/" + req.query.id +"image1"+".png");
      image2.mv("./public/product-image/" + req.query.id +"image2"+".png");

    }
  });
});

// user-Managment

router.get("/view-users",isSession,(req, res) => {
  userHelpers.viewUser().then((showUser) => {
    res.render("admin/user-managment/user-view", { admin: true, showUser });
  });
});

router.get("/block-user/:id", (req, res) => {
  console.log("njan params.....................", req.params.id);
  userHelpers.blockUser(req.params.id).then((result) => {
    req.session.user = null;

    res.redirect("/admin/view-users");
  });
});
router.get("/unBlock-user/:id", (req, res) => {
  userHelpers.unBlockUser(req.params.id).then((result) => {
    console.log("njan result", result);
    res.redirect("/admin/view-users");
  });
});

// category-mangment
router.get('/category',isSession,(req,res)=>{
  ProductHelpers.categoryfind().then((response)=>{
    res.render('admin/categoryManagment/category-add',{admin: true,response})
  })
});

router.post('/admin-addCategory',(req,res)=>{
  console.log(req.body);
  ProductHelpers.addCategory(req.body).then((response)=>{
    res.redirect('/admin/category')
    console.log(response);
    res.redirect('/admin/category')
  })
});

router.get('/category-delete/',(req,res)=>{
  ProductHelpers.categorydelete(req.query.id).then((response)=>{
    res.redirect('/admin/category')
  })
});


// Banner Managment

router.get('/banner',(req,res)=>{
  ProductHelpers.bannerfind().then((response)=>{
    res.render('admin/Banner/banner',{admin: true,response})
  })

 
});

router.post('/add-banner',(req,res)=>{
  console.log("reqbody njan ",req.body);
  console.log("hai njan banner");
  ProductHelpers.bannerAdd(req.body).then((id)=>{
    let banner=req.files.banner;
    banner.mv("./public/banner-image/"+id.insertedId+"banner"+".png", (err) => {
      if(!err){
        res.redirect('/admin/banner')
      }
    })
    
  })
})

module.exports = router;
