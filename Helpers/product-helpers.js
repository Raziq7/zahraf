var db=require('../config/connect')
var collection=require('../config/collections');
var ObjecId=require('mongodb').ObjecId
const { ObjectId } = require('bson');
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
    }
}