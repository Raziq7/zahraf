var express = require("express");
const productHelpers = require("../Helpers/product-helpers");
var router = express.Router();
var ProductHelpers = require("../Helpers/product-helpers");
const userHelpers = require("../Helpers/user-helpers");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("admin/index", { admin: true });
});
// product-Mangment
router.get("/product-manage", (req, res) => {
  ProductHelpers.viewProducts().then((product) => {
    res.render("admin/product-managment/view-product", {
      admin: true,
      product,
    });
  });
});
router.get("/add-poduct", (req, res) => {
  res.render("admin/product-managment/add-product", { admin: true });
});
router.post("/add-product", (req, res) => {
  ProductHelpers.addProduct(req.body).then((id) => {
    let image = req.files.image;
    image.mv("./public/product-image/" + id.insertedId + ".png", (err) => {
      if (!err) {
        res.redirect("admin/product-manage");
      }
    });
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
      image.mv("./public/product-image/" + req.query.id + ".png");
    }
  });
});

// user-Managment

router.get("/view-users", (req, res) => {
  userHelpers.viewUser().then((showUser) => {
    res.render("admin/user-managment/user-view", { admin: true, showUser });
  });
});

router.get("/block-user/:id", (req, res) => {
  console.log("njan params.....................", req.params.id);
  userHelpers.blockUser(req.params.id).then((result) => {
    res.redirect("/admin/view-users");
  });
});
router.get("/unBlock-user/:id", (req, res) => {
  userHelpers.unBlockUser(req.params.id).then((result) => {
    console.log("njan result", result);
    res.redirect("/admin/view-users");
  });
});
router.get("/user-edit/", (req, res) => {
  console.log("hello");
  res.render("admin/user-managment/user-edit", { admin: true});
});

module.exports = router;
