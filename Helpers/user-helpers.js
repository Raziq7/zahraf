var collection = require("../config/collections");
var db = require("../config/connect");
var bcrypt = require("bcrypt");
var ObjecId = require("mongodb").ObjectId;
const { ObjectId, ObjectID } = require("bson");
const { response } = require("express");
const paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AYdjMGuUF787WLH5V6EMGoSz6nT3HDrZtwKuI5SU8or93aFNR7iOrL_3vi-f4_7v2GpBO7I0rYARi3EF',
  'client_secret': 'ELNi2eafvFbWYfQMtdTeKDTwZVHkaE3ojUUatOv-QL-GK_gaGBoZqrL6yml8gQFXs8QWHZU6aOdMnPEc'
});
const Razorpay = require('razorpay');
var instance = new Razorpay({
  key_id: 'rzp_test_QfBZTvTbLNn14a',
  key_secret: 'RMG3dfVYvxStpGeJS20brQ62',
});
const crypto = require('crypto');
let hmac= crypto.createHmac('sha256', 'RMG3dfVYvxStpGeJS20brQ62')
module.exports = {
  doSignup: (userfind) => {
    return new Promise(async (res, rej) => {
      console.log(userfind);
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userfind.email });
      res(user);
      // if(user===null){
      //     userData.password=await bcrypt.hash(userData.password,10)
      //     db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
      //         res(data)
      //     })
      // }else{
      //    res(data)
      // }
    });
  },
  doSuccess: (userData) => {
    return new Promise(async (res, rej) => {
      userData.isblock = true
      console.log("after....", userData);
      userData.password = await bcrypt.hash(userData.password, 10);
      console.log("before....", userData);

      db.get().collection(collection.USER_COLLECTION).insertOne({
        name: userData.name,
        phone: userData.phone,
        password: userData.password,
        email: userData.email,
        address: userData.address,
        isblock: userData.isblock
      })
        .then((data) => {
          res(data);
        });
    });
  },
  doLoginsuccess: (logData) => {
    return new Promise(async (res, rej) => {
      let blockuser = await db.get().collection(collection.USER_COLLECTION).findOne({ email: logData.email, isblock: false })
      if (blockuser) {
        console.log(blockuser);
        res(blockuser)
      } else {
        let response = {};
        let loginStatus = false;
        let user = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .findOne({ email: logData.email, isblock: true });
        console.log("ivde ethi", user);
        if (user) {
          bcrypt.compare(logData.password, user.password).then((status) => {
            console.log("njan", status);
            if (status) {
              response.user = user;
              loginStatus = true;
              response.status = true;
              res(response);
            } else {
              response.status = false;
              res(response)

            }
          });
        } else {
          console.log("not success");
          response.status = false;
          res(response)
        }
      }


    });
  },
  otpVeryfication: (userVerficationNum) => {
    let resolve = {}
    return new Promise(async (res, rej) => {
      let result = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: userVerficationNum })

      if (result) {

        resolve.user = result;
        resolve.status = true
        res(resolve)
      } else {
        resolve.status = false;
        res(resolve)
      }

    })
  },
  findUser:(userId)=>{
    return new Promise(async(res,rej)=>{
     let result=await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)})
     
     res(result)
    })

  },
  viewUser: () => {
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray()
        .then((show) => {
          res(show);
        });
    });
  },

  blockUser: (blockId) => {
    console.log(blockId);
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjecId(blockId) },
          {
            $set: {
              isblock: false,
            },
          }
        )
        .then((result) => {
          res({ status: true });
        });
    });
  },

  unBlockUser: (unBlockId) => {
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(unBlockId) },
          {
            $set: {
              isblock: true,
            },
          }
        )
        .then((data) => {
          res({ status: false });
        });
    });
  },
  CollectionCart: (userId) => {
    return new Promise(async (res, rej) => {
      let cartCollection = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: ObjectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            items: '$products.items',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'items',
            foreignField: '_id',
            as: 'productItem'
          }
        },
        {
          $project: {
            items: 1, quantity: 1, product: { $arrayElemAt: ['$productItem', 0] }
          }
        }

      ]

      ).toArray()

      res(cartCollection)
    })
  },
  addToCart: (productId, userId) => {
    let productObj = {
      items: ObjectId(productId),
      quantity: 1
    }
    return new Promise(async (res, rej) => {
      let cartUser = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
      if (cartUser) {
        console.log("njan cart", cartUser);
        let productExist = cartUser.products.findIndex(product => product.items == productId)
        console.log("njan pro***********", productExist);
        if (productExist != -1) {
          db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId), "products.items": ObjectId(productId) },
            {
              $inc: { 'products.$.quantity': 1 }
            }
          ).then(() => {
            res()
          })

        } else {
          db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) },
            {
              $push: {
                products: productObj
              }
            }).then((response) => {
              res(response)
            })
        } 
      } else {
        let cartCollections = {
          user: ObjectId(userId), 
          products: [productObj]
        }
        db.get().collection(collection.CART_COLLECTION).insertOne(cartCollections).then(() => {
          res()
        })
      }
    })
  },
  addToWshlist:(productId,userId)=>{
    let productObj = {
      items:ObjectId(productId),
    }
    
    return new Promise(async (res, rej) => {
      let wishlistUser = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:ObjectId(userId)})
      console.log(wishlistUser);
      if (wishlistUser) {
        console.log("njan wishlistUser", wishlistUser);
        let productExist = wishlistUser.products.findIndex(product => product.items == productId)
        console.log("njan pro***********", productExist);
        if (productExist != -1) {
          console.log("rasheeedhka")
            res({productExist:true})
        } else {
          db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: ObjectId(userId) },
            {
              $push: {
                products: productObj
              }
            }).then((response) => {
              res(response)
            })
        }
      } else {
        let cartCollections = {
          user: ObjectId(userId),
          products: [productObj]
        }
        db.get().collection(collection.WISHLIST_COLLECTION).insertOne(cartCollections).then(() => {
          res({productExist:false})
        })
      }
    })
  },
  CollectionWishlist: (userId) => {
    return new Promise(async (res, rej) => {
      let wishlistCollection = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
        {
          $match: { user: ObjectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            items: '$products.items',
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'items',
            foreignField: '_id',
            as: 'productItem'
          }
        },
        {
          $project: {
            items: 1, quantity: 1, product: { $arrayElemAt: ['$productItem', 0] }
          }
        }

      ]

      ).toArray()
      console.log("*/*/****////*/*/*/**-*-",wishlistCollection);
      res(wishlistCollection)
    })
  },
  removeWishlist: ({ wishlist, product }) => {
    return new Promise((res, rej) => {
      db.get().collection(collection.WISHLIST_COLLECTION)
        .updateOne({ _id: ObjectId(wishlist) },
          {
            $pull: { products: { items: ObjectId(product) } }
          })
        .then((response) => {
          res(response)
        })
    })
  },
  changeProductQuantity: ({ cart, product, count, quantity }) => {
    count = parseInt(count)
    quantity = parseInt(quantity)
    console.log(quantity);
    console.log(count);

    return new Promise((res, rej) => {
      if (count == -1 && quantity == 1) {
        // db.get().collection(collection.CART_COLLECTION)
        //   .updateOne({ _id: ObjectId(cart) },
        //     {
        //       $pull: { products: { items: ObjectId(product) } }
        //     }).then((response) => {
              //
            // })
            res({removeProduct:true})

      } else {
        db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cart), "products.items": ObjectId(product) },
          {
            $inc: { 'products.$.quantity': count }
          }
        ).then((response) => {
          console.log("njan response", response);
          res({ status: true })
        })
      }


    })
  },
  removeCart: ({ cart, product }) => {
    return new Promise((res, rej) => {
      db.get().collection(collection.CART_COLLECTION)
        .updateOne({ _id: ObjectId(cart) },
          {
            $pull: { products: { items: ObjectId(product) } }
          })
        .then((response) => {
          res(response)
        })
    })
  },
  checkoutTotal: (userId) => {
    return new Promise(async (res, rej) => {

      let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: ObjectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            items: '$products.items',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'items',
            foreignField: '_id',
            as: 'productItem'
          }
        },
        {
          $project: {
            items: 1, quantity: 1, product: { $arrayElemAt: ['$productItem', 0] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
          }
        }
      ]

      ).toArray()
      res(total[0])
    })
  },
  checkoutSubtotal:(userId)=>{
    return new Promise(async (res, rej) => {

      let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: ObjectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            items: '$products.items',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'items',
            foreignField: '_id',
            as: 'productItem'
          }
        },
        {
          $project: {
            items: 1, quantity: 1, product: { $arrayElemAt: ['$productItem', 0] }
          }
        },
        {
           $project: {
             items: 1, quantity: 1,product:1, subTotal: { $sum: { $multiply: [ '$quantity', '$product.price' ] } }
          }
        }
      ]

      ).toArray()
      console.log(total,"*****/***********+-*/-+");
      res(total)
    })
  },
  checkoutChangeSubtotal:(userId)=>{
    return new Promise(async (res, rej) => {

      let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: ObjectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            items: '$products.items',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'items',
            foreignField: '_id',
            as: 'productItem'
          }
        },
        {
          $project: {
            items: 1, quantity: 1, product: { $arrayElemAt: ['$productItem', 0] }
          }
        },
        {
           $project: {
             _id:0,
             subTotal: { $sum: { $multiply: [ '$quantity', '$product.price' ] } }
          }
        }
      ]

      ).toArray()
      total.map((total)=>{
        console.log(total,"*****/***********+-*/-+userIduserIduserId");

        res(total)
      })
    }) 

  },
  addAddress: (addressDetails,userid) => {
    return new Promise((res, rej) => {
      db.get().collection(collection.ADDRESS_COLLECTION).insertOne({userId:userid,addressDetails}).then((response) => {
        res(response)
      })
    })
  },
  findAddress: (userId) => {
    return new Promise(async(res, rej) => {
      let result=await db.get().collection(collection.ADDRESS_COLLECTION).aggregate([
        {
          $match:{
            userId:userId
          }
        },
      ]).toArray()
      res(result)
    })
  },
  getCartProduct: (userId) => {
    return new Promise(async (res, rej) => {
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
      res(cart.products)
    }) 
  },
  placeOrder: (order, cartProducts, totalPrice) => {
    return new Promise(async (res, rej) => {
      for (i = 0; i < cartProducts.length; i++) {
        cartProducts[i].productStatus = order['pay-method'] === "COD" ? 'placed' : 'pending'
        cartProducts[i].Cancel = false;
    }
      let today = new Date()
      let showdetails = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({userId:order.userId})
      //let status = order['pay-method'] === "COD" ? 'placed' : 'pending'
      console.log("njan /*/*/*/*/*/*******order   **",showdetails);
      let date = new Date();
      year = date.getFullYear();
      month = date.getMonth()+1;
      dt = date.getDate();
      
      if (dt < 10) {
        dt = '0' + dt;
      }
      if (month < 10) {
        month = '0' + month;
      }
      
      let fullDate=year+'-' + month + '-'+dt
      let OrderObj = {
        delivaryDetails: {
          country: showdetails.addressDetails.country,
          FirstName: showdetails.addressDetails.fname,
          address: showdetails.addressDetails.address,
          Town: showdetails.addressDetails.towncity,
          State: showdetails.addressDetails.countrycity,
          Pin: showdetails.addressDetails.pincode,
          Phone: showdetails.addressDetails.phone,
          Place: showdetails.addressDetails.place,
        },

        userId: ObjectId(order.userId),
        paymentMethod: order['pay-method'], 
        product: cartProducts,
        total: totalPrice, 
        date: fullDate,
        // dateInt : parseInt(today.getFullYear() + '' + 
        // ( today.getMonth() + 1 ) < 10 ? '0' + (today.getMonth() + 1) : ( today.getMonth() + 1 ) +
        // today.getDate() < 10 ? '0' + today.getDate() : today.getDate()),
        dateInt:parseInt(today.getFullYear() + '' + "0"+( ( today.getMonth() + 1 ) < 10 ? '0' + (today.getMonth() + 1) : ( today.getMonth() + 1 ) ) + '' + ( ( today.getDate() + 1 ) < 10 ? '0' + (today.getDate() + 1) : ( today.getDate()  ) ))


      }
      db.get().collection(collection.ORDER_COLLECTION).insertOne(OrderObj).then((response) => {  
        res(response.insertedId)
      })
    })

  },
  deleteCart:(order)=>{
    return new Promise(async(res,rej)=>{
     await db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(order.userId) })
     res()
    })
  },
  showOrderDetails: (userId) => {
    console.log("njan userId", userId);
    return new Promise(async (res, rej) => {
      let orderDetails = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: { userId: ObjectId(userId) }
        },

        {
          $project: {
            product: '$product',
            date: 1,
            delivaryDetails: 1

          }
        },
        {
          $unwind: '$product'

        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: "product.items",
            foreignField: "_id",
            as: "orderedproducts"
            
          }
        },
        {
          $project: {
            date: 1,
            product:1,
            delivaryDetails: 1,
             productItem: { $arrayElemAt: ['$orderedproducts', 0] }
          }
        },
        {
           $project: {
            date: 1,
            product:1,
            productItem:1,
            delivaryDetails: 1,
            // subTotal: { $sum: { $multiply: [ '$product.quantity', '$productItem.price' ] } }
          }
        }
       
      ]).toArray()
      console.log("orderDetails*********************", orderDetails);
      res(orderDetails)


    })
  },
  cancelOrder: (orderId, orderProId,userId) => {
    return new Promise(async (res, rej) => {
             let pro=await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id: ObjectId(orderId),"product.items":ObjectId(orderProId)},
        {
          $set: {
            "product.$.productStatus": "Cancelled",
            "product.$.Cancel": true

        } 
          })
    console.log(pro);
       res({status:true})
    })
  },

  viewProOrder:(orderId,orderProId,userId)=>{
return new Promise(async(res,rej)=>{
  let viewpro=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
    {
      $match:{
        _id:ObjectId(orderId),
        userId:ObjectId(userId) 
      }
    },
    {
      $project:{
        // delivaryDetails:1,
        product:'$product',
        // total:1,
        // date:1
      }
    },
    {
      $match:{
        "product.items":ObjectId(orderProId)
      }
    },
    {
      $lookup:{
        from:collection.PRODUCT_COLLECTION,
        localField:'product.items',
        foreignField:'_id',
        as:"viewProductItems"
      }
    },
    {
      $unwind: '$viewProductItems'

    },
     {
      $match:{
        "viewProductItems._id":ObjectId(orderProId)
      }
    }
  ]).toArray()
console.log("viewpro********",viewpro);
res(viewpro)

})
  },

  generateRazorPay: (orderId,totalPrice,userid,couponTrue,couponPrice) => {
    console.log(totalPrice.total);
    
    console.log(totalPrice);
    console.log(orderId);
    return new Promise(async(res, rej) => {
      if(couponTrue){
        instance.orders.create({ amount: couponPrice*100, currency: "INR", receipt:""+orderId},(err,order)=>{
          if(err){
            console.log("error is ",err);
            console.log(err);
          }else{
  
            console.log("new Order***",order);
            res(order)
          }  
        })
      }else{
        instance.orders.create({ amount: totalPrice.total*100, currency: "INR", receipt:""+orderId},(err,order)=>{
          if(err){
            console.log("error is ",err);
            console.log(err);
          }else{
  
            console.log("new Order***",order);
            res(order)
          }  
        })
      }
     
    })
  },
  orderIdPick:(orderId)=>{
return new Promise(async(res,rej)=>{
  let order=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId)})
  res(order)

})
  },
  deleteWishlist:(orderId,totalPrice)=>{
    return new Promise(async(res,rej)=>{
      await db.get().collection(collection.WISHLIST_COLLECTION).deleteOne({ user: ObjectId(order.userId) })
    })

  },
  
  verifyPayment:(details)=>{
    return new Promise(async(res,rej)=>{
      await hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
      hmac=hmac.digest('hex')
      if(hmac==details['payment[razorpay_signature]']){
        res()
      }else{ 
        rej()
      }

    }) 
  },
  changePaymentStatus:(orderId,userId)=>{
    return new Promise(async(res,rej)=>{
      console.log("order[receipt]",orderId);
       let orders=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId)})
       console.log("product.jksdfl;kjdflkjdskfskldjlkf54665465465",orders.product);
      let Products= orders.product
      Products.map(product=>{
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId),"product.items":product.items},

        {
          $set:{
            "product.$.productStatus":"placed",
            "product.$.Cancel": false
          }
      }).then((response)=>{
        db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(userId) })
        res()
      })
      })
      res() 
    })
  },
  viewUserProfile:(userEditId)=>{
    return new Promise(async(res,rej)=>{
      let userData=await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjecId(userEditId)})
      res(userData)
    })
  },
  updateUser:(userDataId,userData)=>{
    return new Promise((res,rej)=>{
      console.log(userData,userDataId,"**************-/*-/*-/");

      db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjecId(userDataId)},
      {
        $set:{
              name:userData.name,
              phone:userData.phone,
              address:userData.address
        }
      }).then((result)=>{
        res(result)
      })
    })
  },
  changedPassword:(nowPass,userId)=>{
    console.log(nowPass);
    return new Promise(async(res,rej)=>{
      let userExist=await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjecId(userId)})
      console.log(userExist);
      bcrypt.compare(nowPass.oldPass,userExist.password).then(async(result)=>{
        if(result){
          console.log("***********",nowPass);
          nowPass=await bcrypt.hash(nowPass.conf,10)
          db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjecId(userId)},
          {
            $set:{
                  password: nowPass
            }
          }).then((result)=>{
            res({status:true})  
          })
        }else{
          res({status:false})
        }
      })
     
   
    })
  },
  editAddress:(addresId)=>{
    return new Promise(async(res,rej)=>{
     let showAddress=await db.get().collection(collection.ADDRESS_COLLECTION).find({_id:ObjectId(addresId)}).toArray()
     res(showAddress)
    })
  },
  modifyAddress:(Address)=>{
    return new Promise((res,rej)=>{
       db.get().collection(collection.ADDRESS_COLLECTION).updateOne({_id:ObjectId(Address.id)},
       {
         $set:{
          country:Address.country,
          fname:Address.fname,
          ["l-name"]:Address.lname,
          address:Address.address,
          towncity:Address.towncity,
          countrycity:Address.countrycity,
          pincode:Address.pincode,
          phone:Address.phone,
          place:Address.place

         }
       }).then((result)=>{
         res(result)
       })
    })
  },
  chechCoupon:(coupunCode,userId)=>{
    return new Promise(async(res,rej)=>{
     db.get().collection(collection.COUPON_OFFER).findOne({code:coupunCode}).then((findCoupn)=>{
      console.log(findCoupn);
       res(findCoupn)
     })
 
    })
  },
  getCoupon:(couponCode,userId,discount)=>{
    console.log("koooiiiiii");
    return new Promise(async(res,rej)=>{
      //let findCoupn=await db.get().collection(collection.COUPON_OFFER).findOne({code:couponCode})
         
        let findCartPro = await db.get().collection(collection.CART_COLLECTION).aggregate([
          {
            $match: { user: ObjectId(userId) }
          },
          {
            $unwind: '$products'
          },
          {
            $project: {
              items: '$products.items',
              quantity: '$products.quantity'
            }
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: 'items',
              foreignField: '_id',
              as: 'productItem'
            }
          },
          {
            $project: {
              items: 1, quantity: 1, product: { $arrayElemAt: ['$productItem', 0] }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
            }
          }
        ]).toArray()
        findCartPro.map((product)=>{
          console.log(product.total)
          let total=product.total
          total=parseInt(total)
          let coupondiscount=discount
          coupondiscount=parseInt(coupondiscount)
          let totalDiscountPrice=total-(total*coupondiscount/100)
          totalDiscountPrice=parseInt(totalDiscountPrice)
          console.log("****9633.5-++",totalDiscountPrice);
          res(totalDiscountPrice)
        })
      
    })

  },
  checkcCouponExist:(couponCode,userId,couponPrice)=>{
    let userid=userId+""
    return new Promise(async(res,rej)=>{
     let userId=await db.get().collection(collection.COUPON_EXIST).findOne({ $and: [ { userId:userid }, { couponCode: couponCode} ] })
     console.log("couponExit//**/",userId);
     if(userId){
      res({status:true})
     }else{
      //let userfind=await db.get().collection(collection.COUPON_EXIST).findOne({userId:userid})
      //  if(userfind){
      //   await db.get().collection(collection.COUPON_EXIST).updateOne({ user: ObjectId(userId) },
      //   {
      //     $push: {
      //       couponCode:couponCode
      //     }
      //   })
      //   res({status:false})
      // }else{

      //   let creatExitCoupon=await db.get().collection(collection.COUPON_EXIST).insertOne({userId:userid,couponCode:couponCode,couponPrice:couponPrice})
      // }
      res({status:false})
     }
    })
 
  },
  couponCodeExist:(userid,couponCode,couponPrice)=>{
    return new Promise(async(res,rej)=>{
let userfind=await db.get().collection(collection.COUPON_EXIST).findOne({userId:userid})
       if(userfind){
        await db.get().collection(collection.COUPON_EXIST).updateOne({ user: ObjectId(userid) },
        {
          $push: {
            couponCode:couponCode
          }
        })
      }else{

        let creatExitCoupon=await db.get().collection(collection.COUPON_EXIST).insertOne({userId:userid,couponCode:couponCode,couponPrice:couponPrice})
      }
      res({status:true})

    })

  },
  decrementproduct:(userId,order)=>{
return new Promise(async(res,rej)=>{
 let decrement= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
  {
    $match:{ _id: ObjectId(order), userId: ObjectId(userId) }
  },
  {

    $project:{
      product:1,
    }

  },
  {
    $unwind:'$product'
  }

]).toArray()
console.log("*****",decrement);

decrement.map(async(product)=>{
  proId=product.product.items
  console.log(proId,"***-*-*-");
    await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(proId)},
    {
      $inc:{stock:-product.product.quantity,soldstock:product.product.quantity}
     
    }).then((result)=>{
      console.log(result);
    })
})

res()
  // {
  //   $inc: { 'products.$.quantity': count }
  // }
})
  },
  findOffer:(userid)=>{
    return new Promise(async(res,rej)=>{
      let result =await db.get().collection(collection.COUPON_EXIST).findOne({userId:userid})
      res(result)
    })
  },
  searchProduct:(content)=>{
    return new Promise(async(res,rej)=>{
      let getaproduct=await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
        {
          $match:{$or: [{ 'name': { $regex: content, $options: 'i' } },
          { 'category': { $regex: content, $options: 'i' } }, { 'description': { $regex: content, $options: 'i' } }]
        }
      }
      ]).toArray()
      res(getaproduct)
    })
  },
  findCategoryPro:(categoryId)=>{
    return new Promise(async(res,rej)=>{
     let showCategorypro= await db.get().collection(collection.PRODUCT_COLLECTION).find({category:categoryId}).toArray()
     res(showCategorypro)
    })
  },
  findSortPro:()=>{
    return new Promise(async(res,rej)=>{
     let result=await db.get().collection(collection.PRODUCT_COLLECTION).aggregate(
        [
          { $sort : { name : -1 } }
        ]
     ).toArray()
     res(result)

    })
  },
  PriceSort:()=>{
    return new Promise(async(res,rej)=>{
      let result=await db.get().collection(collection.PRODUCT_COLLECTION).aggregate(
        [
          { $sort : { price : 1 } }
        ]
     ).toArray()
     console.log(result);
     res(result)

    })
  },
  UsersCount:()=>{
    return new Promise(async(res,rej)=>{
     let findUser=await db.get().collection(collection.USER_COLLECTION).aggregate( [
        { $group: { _id: null, myCount: { $sum: 1 } } },
        { $project: { _id: 0 } }
     ] ).toArray()
     res(findUser)
    })
  },
  howMuchProduct:()=>{
    return new Promise(async(res,rej)=>{
      let findsale=await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
        { $group: { _id: null, myProduct: { $sum: 1 } } },
        { $project: { _id: 0 } }

      ]).toArray()
      res(findsale)
  })
},
howMuchOrder:()=>{
  return new Promise(async(res,rej)=>{
    let findOrder=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      {
        $project:{
          product:1
        }
      },
      {
        $unwind:'$product'
      },
      { $group: { _id: null, myProduct: { $sum: 1 } } }
    ]).toArray()
    res(findOrder)

  })
},
howMuchDelOrder:()=>{
  return new Promise(async(res,rej)=>{
    let findDel=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      {
        $project:{
          product:1
        }
},
{
  $unwind:'$product'
},
{
  $match:{
    'product.productStatus':'Delivered'
  }
},
{
$group:{_id:null,myOrderDel:{$sum:1}}
}
]).toArray()
res(findDel)
  })
  }
}
