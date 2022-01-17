var collection = require("../config/collections");
var db = require("../config/connect");
var bcrypt = require("bcrypt");
var ObjecId = require("mongodb").ObjectId;
const { ObjectId } = require("bson");
const { response } = require("express");
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
    return new Promise(async(res, rej) => {
         userData.isblock=true
         console.log("after....",userData);
         userData.password = await bcrypt.hash(userData.password, 10);
         console.log("before....",userData);

         db.get().collection(collection.USER_COLLECTION).insertOne({
          name: userData.name,
          phone: userData.phone,
          password: userData.password,
          email: userData.email,
          address: userData.address,
          isblock:userData.isblock
        })
        .then((data) => {
          res(data);
        });
    });
  },
  doLoginsuccess: (logData) => {
    return new Promise(async (res, rej) => {
      let blockuser= await db.get().collection(collection.USER_COLLECTION).findOne({ email: logData.email,isblock:false})
      if(blockuser){
        console.log(blockuser);
        res(blockuser)
      }else{
        let response = {};
        let loginStatus = false;
        let user = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .findOne({ email: logData.email,isblock:true });
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
              response.status=false;
              res(response)
              
            }
          });
        }else{
          console.log("not success");
          response.status=false;
          res(response)
                }
      }

    
    });
  },
  otpVeryfication:(userVerficationNum)=>{
    let resolve={}
    return new Promise(async(res,rej)=>{
      let result=await db.get().collection(collection.USER_COLLECTION).findOne({phone:userVerficationNum})
      
      if(result){
       
        resolve.user=result;
        resolve.status=true
        res(resolve)
      }else{
resolve.status=false;
res(resolve)
      }
    
    })
  },
  // findUser:()=>{
  //   return new Promise(async(res,rej)=>{
  //    let result=await db.get().collection(collection.USER_COLLECTION).find()
  //    cal=result
  //    res(cal)
  //   })

  // },
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
  CollectionCart:(userId)=>{
    return new Promise(async(res,rej)=>{
        let cartCollection=await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{user:ObjectId(userId)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    items:'$products.items',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'items',
                    foreignField:'_id',
                    as:'productItem'
                }
            },
            {
                $project:{
                    items:1,quantity:1,product:{$arrayElemAt:['$productItem',0]}
                }
            }
        
        ]
        
        ).toArray()

        res(cartCollection)
    })
},
  addToCart:(productId,userId)=>{
    let productObj={
        items:ObjectId(productId),
        quantity:1
    }
    return new Promise(async(res,rej)=>{
       let cartUser=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
       if(cartUser){
           console.log("njan cart",cartUser);
           let productExist= cartUser.products.findIndex(product=>product.items==productId)
           console.log("njan pro***********",productExist);
           if(productExist != -1){
               db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId),"products.items":ObjectId(productId)},
               {
                   $inc:{'products.$.quantity':1}
               }
               ).then(()=>{
                   res()
               })

           }else{
           db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},
           {
               $push:{
                   products:productObj
               }
           }).then((response)=>{
               res(response)
           })
           }
       }else{
        let cartCollections={
            user:ObjectId(userId),
            products:[productObj]
        }
        db.get().collection(collection.CART_COLLECTION).insertOne(cartCollections).then(()=>{
            res()
        })
       }
    })
},
changeProductQuantity:({cart,product,count,quantity})=>{
 count=parseInt(count)
 quantity=parseInt(quantity)
 console.log(quantity);
 console.log(count);

  return new Promise((res,rej)=>{
    if(count==-1 && quantity==1){
      db.get().collection(collection.CART_COLLECTION)
      .updateOne({_id:ObjectId(cart)},
      {
        $pull:{products:{items:ObjectId(product)}}
      }).then((response)=>{
        res({removeProduct:true})
      })
      console.log("hi*************",quantity)

      
    }else{
      console.log("hello*************",count)
      db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectId(cart),"products.items":ObjectId(product)},
      {
        $inc:{'products.$.quantity':count}
          }
          ).then((response)=>{
              console.log("njan response",response);
              res({status:true})
          })
      }
      

  })
},
removeCart:({cart,product})=>{
   return new Promise((res,rej)=>{
    db.get().collection(collection.CART_COLLECTION)
    .updateOne({_id:ObjectId(cart)},
    {
      $pull:{products:{items:ObjectId(product)}}
    })
     .then((response)=>{
       res(response)
     })
   })
  },
  checkoutTotal:(userId)=>{
    return new Promise(async(res,rej)=>{
      let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
            $match:{user:ObjectId(userId)}
        },
        {
            $unwind:'$products'
        },
        {
            $project:{
                items:'$products.items',
                quantity:'$products.quantity'
            }
        },
        {
            $lookup:{
                from:collection.PRODUCT_COLLECTION,
                localField:'items',
                foreignField:'_id',
                as:'productItem'
            }
        },
        {
            $project:{
                items:1,quantity:1,product:{$arrayElemAt:['$productItem',0]}
            }
        },
        {
          $group:{
            _id:null,
            total:{$sum:{$multiply:['$quantity','$product.price']}}
          }
        }
    
    ]
    
    ).toArray()
    res(total[0])
  })
},
addAddress:(addressDetails)=>{
  return new Promise((res,rej)=>{
    db.get().collection(collection.ADDRESS_COLLECTION).insertOne(addressDetails).then((response)=>{
      res(response)
    })
  })
},
findAddress:()=>{
  return new Promise((res,rej)=>{
    db.get().collection(collection.ADDRESS_COLLECTION).find().toArray().then((response)=>{
      res(response)
    })
  })
},
getCartProduct:(userId)=>{
  return new Promise(async(res,rej)=>{
   let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
   res(cart.products)
  })
},
placeOrder:(order,cartProducts,totalPrice)=>{
  return new Promise(async(res,rej)=>{

    let showdetails= await db.get().collection(collection.ADDRESS_COLLECTION).findOne({_id:ObjectId(order.name)})
    let status=order['pay-method']==="COD"?'placed':'pending'
    let OrderObj={
      delivaryDetails:{
        country:showdetails.country,
        FirstName:showdetails.fname,
        address:showdetails.address,
        Town:showdetails.towncity,
        State:showdetails.countrycity,
        Pin:showdetails.pincode,
        Phone:showdetails.phone,
        Place:showdetails.place
      },
      userId:ObjectId(order.userId),
      paymentMethod:order['pay-method'],
      product:cartProducts,
      total:totalPrice,
      status:status
    }
    db.get().collection(collection.ORDER_COLLECTION).insertOne(OrderObj).then((response)=>{
      db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(order.userId)})
      res()
    })
  })

},
showOrderDetails:(userId)=>{
  console.log("njan userId",userId);
  return new Promise(async(res,rej)=>{
    let orderDetails=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
  res(orderDetails)
   

  })
}
  // editUser:(userEditId)=>{
  //   return new Promise((res,rej)=>{
  //     let userData=db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjecId(userEditId)})
  //     res(userData)
  //   })
  // },
  // updateUser:(userDataId,userData)=>{
  //   return new Promise((res,rej)=>{
  //     db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjecId(userDataId)},
  //     {
  //       $set:{
  //             name:userData.name,
  //             phone:userData.phone,
  //             email:userData.email,
  //             address:userData.address
  //       }
  //     })
  //   })
  // }


}