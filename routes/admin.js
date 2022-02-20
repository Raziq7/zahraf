const { response } = require("express");
var express = require("express");
const dotenv = require('dotenv');
dotenv.config()
const productHelpers = require("../Helpers/product-helpers");
var router = express.Router();
var ProductHelpers = require("../Helpers/product-helpers");
const userHelpers = require("../Helpers/user-helpers");
const AWS=require('aws-sdk')
const uuid=require('uuid')

const s3 = new AWS.S3({
  credentials: {
      accessKeyId: process.env.AWS_ID,
      secretAccessKey: process.env.AWS_SECRET,
  },
});
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ID,
//   secretAccessKey: process.env.AWS_SECRET
// })

// admin session
let isSession = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/admin/admin-login");
  }
};
/* GET users listing. */
router.get("/",async function (req, res, next) {
  if(req.session.loggedIn){
    let findUsers=await userHelpers.UsersCount()
    let product= await userHelpers.howMuchProduct()
  let TotalOrders=await userHelpers.howMuchOrder()
  let TotalDelOrders=await userHelpers.howMuchDelOrder()

    console.log("productproductproduct",TotalOrders);
    res.render("admin/index", { admin: true , findUsers,product,TotalOrders,TotalDelOrders});
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

    console.log(image.name);
    console.log(image.data);

    let myFile=image.name.split(".")
    const fileType = myFile[myFile.length - 1]
try{
  console.log("*****in try params");
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: id.insertedId+"image"+".png",
    Body: image.data
}
console.log(params,"/*****");
s3.upload(params,(err,data)=>{
  if (err) {
    console.log("erererererrrrrrrrrr",err);
    //  res.redirect("/admin/product-manage");
     }else{
       console.log("daTaaaaaaaaaaaaa",data);
     }
})
}catch (error){
  console.log(error);
  console.log("************in catch error");
}
// image1

let myFile1=image1.name.split(".")
// const fileType = myFile1[myFile1.length - 1]
try{
console.log("*****in try params");
const params = {
Bucket: process.env.AWS_BUCKET_NAME,
Key: id.insertedId+"image1"+".png",
Body: image1.data
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

// image2

let myFile2=image2.name.split(".")
// const fileType = myFile1[myFile1.length - 1]
try{
console.log("*****in try params");
const params = {
Bucket: process.env.AWS_BUCKET_NAME,
Key: id.insertedId+"image2"+".png",
Body: image2.data
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

  res.redirect("/admin/product-manage");
    // image.mv("./public/product-image/" + id.insertedId+"image"+".png", (err) => {
    //   if (!err) {
    //     image1.mv("./public/product-image/"+id.insertedId+"image1"+".png",(err)=>{
    //       console.log("njan "+image1);
    //       if(!err){
    //         image2.mv("./public/product-image/"+id.insertedId+"image2"+".png",(err)=>{
    //           console.log("njan "+image1);
    //           if(!err){
    //             res.redirect("/admin/product-manage");             }
    //         })
    //       }
    //     })
    //   }
    // })
  }); 
});

router.post("/delete-product", (req, res) => {
  console.log("/**/*/*/*/*/",req.body);
  let id = req.body.proId;
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
    console.log("**/*/85964754",response);
    if(req.files){
      let image = req.files.image; 
      let image1 = req.files.image1;
      let image2 = req.files.image2;
      if(image){
      // image.mv("./public/product-image/" + req.query.id +"image"+".png");

    console.log(image.name);
    console.log(image.data);

    let myFile=image.name.split(".")
    const fileType = myFile[myFile.length - 1]
try{
  console.log("*****in try params");
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: req.query.id+"image"+".png",
    Body: image.data
}
console.log(params,"/*****");
s3.upload(params,(err,data)=>{
  if (err) {
    console.log("erererererrrrrrrrrr",err);
    //  res.redirect("/admin/product-manage");
     }else{
       console.log("daTaaaaaaaaaaaaa",data);
     }
})
}catch (error){
  console.log(error);
  console.log("************in catch error");
}

      }
      if(image1){
        // image1.mv("./public/product-image/" + req.query.id +"image1"+".png");


        // image1

let myFile1=image1.name.split(".")
// const fileType = myFile1[myFile1.length - 1]
try{
console.log("*****in try params");
const params = {
Bucket: process.env.AWS_BUCKET_NAME,
Key: req.query.id+"image1"+".png",
Body: image1.data
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

 }
if(image2){
  // image2.mv("./public/product-image/" + req.query.id +"image2"+".png");
  // image2

let myFile2=image2.name.split(".")
// const fileType = myFile1[myFile1.length - 1]
try{
console.log("*****in try params");
const params = {
Bucket: process.env.AWS_BUCKET_NAME,
Key: req.query.id+"image2"+".png",
Body: image2.data
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

}

}
res.redirect("/admin/product-manage");
    
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
    
  })
});

router.post('/category-delete',(req,res)=>{
  ProductHelpers.categorydelete(req.body.categoryId).then((response)=>{
    res.redirect('/admin/category')
  })
});


// Banner Managment

router.get('/banner',(req,res)=>{
  ProductHelpers.bannerfind().then((response)=>{
    console.log(response);
    res.render('admin/Banner/banner',{admin: true,response})
  })

 
});

router.post('/add-banner',(req,res)=>{
  console.log("reqbody njan ",req.body);
  console.log("hai njan banner");
  ProductHelpers.bannerAdd(req.body).then((id)=>{
    console.log("hello njan Id*********",id);
    let banner=req.files.banner;
    let myFile2=banner.name.split(".")
// const fileType = myFile1[myFile1.length - 1]
try{
console.log("*****in try params");
const params = {
Bucket: process.env.AWS_BUCKET_NAME,
Key: id.insertedId+"banner"+".png",
Body: banner.data
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
    // banner.mv("./public/banner-image/"+id.insertedId+"banner"+".png", (err) => {
      // if(!err){
        res.redirect('/admin/banner')
      // }
    // })
    
  })
});

router.post('/Banner-delete/',(req,res)=>{
  ProductHelpers.deleteBanner(req.body.bannerId).then((result)=>{
    console.log("*****in try params",req.body.bannerId);

    try{
      const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.body.bannerId+"banner"+".png",
      }
      console.log(params,"/*****");
      s3.deleteObject(params,(err,data)=>{
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
    res.redirect('/admin/banner')
  })

});
// Smaller Banner Managment
router.get('/SmallBanner',async(req,res)=>{
  let showSmallHeader=await ProductHelpers.smallBanner1Find()
  let showSmallHeader2=await ProductHelpers.smallBanner2Find()
  let showSmallHeader3=await ProductHelpers.smallBanner3Find()
  let showSmallHeader4=await ProductHelpers.smallBanner4Find()

  res.render('admin/Banner/smallerBanner',{admin: true,showSmallHeader,showSmallHeader2,showSmallHeader3,showSmallHeader4})
});
//firns smallImage
router.post('/small-banner',(req,res)=>{
  console.log(req.body);
  ProductHelpers.AddFirstSmallBanner(req.body).then((id)=>{
    console.log("hello njan Id*********",id);
    let banner=req.files.banner;
    try{
      console.log("*****in try params");
      const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: id.insertedId+"smallbanner"+".png",
      Body: banner.data
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
      res.redirect('/admin/SmallBanner')
    // banner.mv("./public/banner-image/"+id.insertedId+"smallbanner"+".png", (err) => {
    //   if(!err){
    //     res.redirect('/admin/SmallBanner')
    //   }
    // })
    
  })
});
router.post('/small-banner1',(req,res)=>{
  console.log(req.body);
  ProductHelpers.AddSecondSmallBanner(req.body).then((id)=>{
    console.log("hello njan Id*********",id);
    let banner=req.files.banner;

    try{
      console.log("*****in try params");
      const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: id.insertedId+"smallbanner1"+".png",
      Body: banner.data
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
      res.redirect('/admin/SmallBanner')
    // banner.mv("./public/banner-image/"+id.insertedId+"smallbanner1"+".png", (err) => {
    //   if(!err){
    //     
    //   }
    // })
    
  })
});

router.post('/small-banner2',(req,res)=>{
  console.log(req.body);
  ProductHelpers.AddThirdSmallBanner(req.body).then((id)=>{
    console.log("hello njan Id*********",id);
    let banner=req.files.banner;
    try{
      console.log("*****in try params");
      const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: id.insertedId+"smallbanner2"+".png",
      Body: banner.data
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
      res.redirect('/admin/SmallBanner')
    // banner.mv("./public/banner-image/"+id.insertedId+"smallbanner2"+".png", (err) => {
    //   if(!err){
    //     
    //   }
    // })
    
  })
});
router.post('/small-banner3',(req,res)=>{
  console.log(req.body);
  ProductHelpers.AddFourthSmallBanner(req.body).then((id)=>{
    console.log("hello njan Id*********",id);
    let banner=req.files.banner;
    try{
      console.log("*****in try params");
      const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: id.insertedId+"smallbanner3"+".png",
      Body: banner.data
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
      res.redirect('/admin/SmallBanner')

    // banner.mv("./public/banner-image/"+id.insertedId+"smallbanner3"+".png", (err) => {
    //   if(!err){
    //   }
    // })
    
  })
});
router.post('/smallBanner-delete',(req,res)=>{
  console.log("validity*********");

  console.log(req.body);
  ProductHelpers.deleteSmallBanner(req.body.smallbannerId).then((result)=>{

    try{
      const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.body.smallbannerId+"smallbanner"+".png",
      }
      console.log(params,"/*****");
      s3.deleteObject(params,(err,data)=>{
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
    res.redirect('/admin/SmallBanner')
  })
});
router.post('/smallBanner-delete2',(req,res)=>{
  console.log("validity*********");
  console.log(req.body);
  ProductHelpers.deleteSmallBanner2(req.body.smallbannerId).then((result)=>{
    try{
      const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.body.smallbannerId+"smallbanner2"+".png",
      }
      console.log(params,"/*****");
      s3.deleteObject(params,(err,data)=>{
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
    res.redirect('/admin/SmallBanner')
  })
})
router.post('/smallBanner-delete3',(req,res)=>{
  console.log("validity*********");

  console.log(req.body);
  ProductHelpers.deleteSmallBanner3(req.body.smallbannerId).then((result)=>{
    try{
      const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.body.smallbannerId+"smallbanner3"+".png",
      }
      console.log(params,"/*****");
      s3.deleteObject(params,(err,data)=>{
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
    res.redirect('/admin/SmallBanner')
  })
})

router.post('/smallBanner-delete4',(req,res)=>{
  console.log("validity*********");

  console.log(req.body);
  ProductHelpers.deleteSmallBanner4(req.body.smallbannerId).then((result)=>{
    res.redirect('/admin/SmallBanner')
  })
})
// category offer
router.get("/category-offer",async(req,res)=>{
  let offerview=await ProductHelpers. getCategoryOffer()
  let category=await ProductHelpers.categoryfind()
  res.render('admin/offerManagment/offer',{admin: true,offerview,category})
});

router.post('/category-offer',async(req,res)=>{
 
 
      console.log(req.body);
      let viewPro=await ProductHelpers.addCategoryOffer(req.body)
      res.json(viewPro)
      // res.redirect('/admin/category-offer')
   
  });
  router.post('/deleteOffer',async(req,res)=>{
    console.log("*************",req.body.offerItem);
    console.log("*************",req.body.catOfferId);

    let response=await ProductHelpers.deleteCategoryOffer(req.body.catOfferId,req.body.offerItem)
    res.json({status:true})

  });

  router.get('/order-Managment',async(req,res)=>{
    let orders=await ProductHelpers.showAllOrderDetails()
    res.render('admin/orderManagment/order-managment',{admin:true,orders})
  });
 //product offer
router.get('/product-offer',async(req,res)=>{
  console.log("hello");
  let viewPro= await ProductHelpers.viewProducts()
  let findofferPro= await ProductHelpers.viewOfferPro()
  console.log("viewPro**/**/*85*-+5-*/53+*865665656****/*-*-/*/-* ",viewPro);
    res.render('admin/offerManagment/product-offer',{admin: true,viewPro,findofferPro})
  
});

router.post('/product-offer',(req,res)=>{
  productHelpers.addProductOffer(req.body).then((offer)=>{  
    res.json(offer)
  })
});

router.post('/deleteOfferPro',(req,res)=>{
  console.log(req.body);
  productHelpers.deleteProOffer(req.body.proOfferId,req.body.profferItem)
  res.json({status:true})
});


//change order status
  router.post('/changeOrderStatus',(req,res)=>{
      ProductHelpers.changeToshipped(req.body.value,req.body.orderId,req.body.productId).then((response)=>{
        res.json(response)
      
    } )

  });
//coupon
router.get('/coupon-offer',(req,res)=>{
  productHelpers.showCoupon().then((coupons)=>{
    console.log("//***---+++",coupons);

    res.render('admin/offerManagment/coupon-offer',{admin: true,coupons})
  })
});
router.post('/couponSubmit',(req,res)=>{
  console.log("hello post",req.body);
  ProductHelpers.getcouponOffer(req.body).then((result)=>{
    res.redirect('/admin/coupon-offer')
  })
});
router.post('/deleteOfferCoupon',(req,res)=>{
  productHelpers.deleteCouponOffer(req.body.couponOfferId,req.body.couponfferId)
  res.json({status:true})
});

//reoprts
//USER Report
router.get('/user-report',async(req,res)=>{
  let resultPro=await ProductHelpers.findReport() 
  console.log("resultPro***9989",resultPro);
  res.render('admin/reports/users-report',{admin:true,resultPro})
});
// stock report
router.get('/stock-report',async(req,res)=>{
let product= await ProductHelpers.viewProducts()
console.log(product);
  res.render('admin/reports/stock-report',{admin:true,product})
});
//sales
router.get('/sales-report',async(req,res)=>{
  var product;
  if( req.session.searchPro){
    product=req.session.findSearchPro
    req.session.searchPro=false

  }else{
    product= await ProductHelpers.findSalesReport()
    
    console.log(product);
  }
    res.render('admin/reports/sales-report',{admin:true,product})
  });

  //date
  router.post('/searchDate',async(req,res)=>{
    console.log("date search",req.body);
   let findSearchPro=await ProductHelpers.DateSearch(req.body.fromDate,req.body.toDate)
   req.session.findSearchPro=findSearchPro
   req.session.searchPro=true
   res.redirect('/admin/sales-report')
  })

  router.post('/getdashboard_data',async (req, res) => {
    let sales = [];
    let previous = [];
    for (var i =1; i<=12; i++){
      sales.push(await ProductHelpers.findCurrentMonthSale(i))
       }

       for (var i =1; i<=12; i++){
        previous.push(await ProductHelpers.findPreviousYearSale(i))
         }
        

  res.send({   monthwise :sales , previousmonth : previous})
  });


  router.post('/getdashboard_proData',async (req, res) => {
   
         let pro = await ProductHelpers.thisYearMostUsers()
        

    res.send({ productArr : pro.productArr, quantityArr : pro.quantityArr })
  });
  router.post('/getdashboard_categoryPro',async(req,res)=>{
    let pro = await ProductHelpers.thisYearMostCategory()
    console.log("********",pro);
    res.send({ categoryArr : pro.uniqueArr, quantityCategoryArr : pro.uniquequantityArr })
  });
  
module.exports = router; 