var db=require('../config/connect')
var collection=require('../config/collections');
var ObjecId=require('mongodb').ObjecId
const { ObjectId } = require('bson');
const { response } = require('express');
module.exports={

    addProduct:(product)=>{
        return new Promise((res,rej)=>{

            console.log(product);
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
                res(data)
            })
        })
    },
    viewProducts:()=>{
        return new Promise(async(res,rej)=>{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            res(product)
        })
    },
    deleteProduct:(deleteProductId)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id : ObjectId(deleteProductId)}).then((result)=>{
                res(result)
            })

                })
    },
    editProduct:(editId)=>{
        return new Promise(async(res,rej)=>{
          let editProId= await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id : ObjectId(editId)})
          res(editProId)
        })
    },
    
    updateProduct:(updateProId)=>{
        return new Promise((res,rej)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne(updateProId)
        })
    },
    updateProduct:(poductId,updateDetails)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(poductId)},
            {
                $set:{
                    name:updateDetails.name,
                    category:updateDetails.category,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
                    price:updateDetails.price,
                    description:updateDetails.description,


            }}).then((result)=>{
                res(result)
            })
        })
    },
    addCategory:(category)=>{
    return new Promise((res,rej)=>{
        db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((result)=>{
            res(result)
        })
    })
    },
    categoryfind:()=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).find().toArray().then((result)=>{
                res(result)
            })
        })
    },
    categorydelete:(categoryDelId)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:ObjectId(categoryDelId)}).then((resultData)=>{
                res(resultData)
            })
        })
    },
    productDetails:(productDetailsId)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(productDetailsId)}).then((result)=>{
                res(result)
            })
        })
    },
    bannerAdd:(bannerImage)=>{
        return new Promise(async(res,rej)=>{
          let result =await db.get().collection(collection.BANNER_COLLECTIONS).insertOne(bannerImage)
                res(result)
            
        })
    },
    bannerfind:()=>{
        return new Promise((res,rej)=>{
           db.get().collection(collection.BANNER_COLLECTIONS).find().toArray().then((result)=>{
               res(result)
           })
        })
    },
    
    
     getCartCount:(userId)=>{
        return new Promise(async(res,rej)=>{
            let count=0
     
            let user=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            
            if(user){
                console.log("njan count",userId);
                let cartCount=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
                
                count=count+cartCount.products.length;
                res(count)
            }else{
                res()
            }
        })
     
    },
   
}