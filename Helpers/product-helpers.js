var db = require('../config/connect')
var collection = require('../config/collections');
var ObjecId = require('mongodb').ObjecId
const { ObjectId } = require('bson');
const { response } = require('express');
module.exports = {

    addProduct: (product) => {
        product.offer=offer =false;
        product.ProductOffer=false;
        product.stock=parseInt(product.stock)
        product.currentstock=product.stock
        product.price=parseInt(product.price)



        return new Promise((res, rej) => {

            console.log(product);
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {

                res(data)
            })
        })
    },
    viewProducts: () => {
        return new Promise(async (res, rej) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            res(product)
        })
    },
    findSalesReport:()=>{
        return new Promise(async(res,rej)=>{
           let findsale=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        'product.productStatus':"Delivered"
                    }
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        userId:1,
                        paymentMethod:1,
                        product:1,
                        date:1
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'product.items',
                        foreignField:'_id',
                        as:'salesReport'
                    }
                },
                {
                    $unwind:'$salesReport'
                },
                {
                    $project: {
                        _id: null,
                     
                       total : { $multiply : ["$salesReport.price",0.1 ] } ,
                         userId:1,
                        paymentMethod:1,
                        product:1,
                        date:1,
                        salesReport:1
                        
                      }
                }
            ]).toArray()

            console.log("****findsale",findsale);
           res(findsale)
        })
    },
    deleteProduct: (deleteProductId) => {
        return new Promise((res, rej) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: ObjectId(deleteProductId) }).then((result) => {
                res(result)
            })

        })
    },
    editProduct: (editId) => {
        return new Promise(async (res, rej) => {
            let editProId = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(editId) })
            res(editProId)
        })
    },

    updateProduct: (updateProId) => {
        return new Promise((res, rej) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne(updateProId)
        })
    },
    updateProduct: (poductId, updateDetails) => {
        return new Promise((res, rej) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(poductId) },
                {
                    $set: {
                        name: updateDetails.name,
                        category: updateDetails.category,
                        price: updateDetails.price,
                        description: updateDetails.description,


                    }
                }).then((result) => {
                    res(result)
                })
        })
    },
    addCategory: (category) => {
        return new Promise((res, rej) => {
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((result) => {
                res(result)
            })
        })
    },
    categoryfind: () => {
        return new Promise((res, rej) => {
            db.get().collection(collection.CATEGORY_COLLECTION).find().toArray().then((result) => {
                res(result)
            })
        })
    },
    categorydelete: (categoryDelId) => {
        return new Promise((res, rej) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: ObjectId(categoryDelId) }).then((resultData) => {
                res(resultData)
            })
        })
    },
    productDetails: (productDetailsId) => {
        return new Promise((res, rej) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(productDetailsId) }).then((result) => {
                res(result)
            })
        })
    },
    bannerAdd: (bannerImage) => {
        return new Promise(async (res, rej) => {
            let result = await db.get().collection(collection.BANNER_COLLECTIONS).insertOne(bannerImage)
            res(result)

        })
    },
    bannerfind: () => {
        return new Promise((res, rej) => {
            db.get().collection(collection.BANNER_COLLECTIONS).find().toArray().then((result) => {
                res(result)
            })
        })
    },
    smallBannerfind1:() => {
        return new Promise((res, rej) => {
            db.get().collection(collection.SMALL_BANNER).find().toArray().then((result) => {
                res(result)
            })
        })
    },
    smallBannerfind2:() => {
        return new Promise((res, rej) => {
            db.get().collection(collection.SMALL_BANNER1).find().toArray().then((result) => {
                res(result)
            })
        })
    },
    smallBannerfind3:() => {
        return new Promise((res, rej) => {
            db.get().collection(collection.SMALL_BANNER2).find().toArray().then((result) => {
                res(result)
            })
        })
    },
    smallBannerfind4:() => {
        return new Promise((res, rej) => {
            db.get().collection(collection.SMALL_BANNER3).find().toArray().then((result) => {
                res(result)
            })
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (res, rej) => {
            let count = 0

            let user = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })

            if (user) {
                console.log("njan count", userId);
                let cartCount = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })

                count = count + cartCount.products.length;
                res(count)
            } else {
                res()
            }
        })

    },
    getWishlistCount: (userId) => {
        return new Promise(async (res, rej) => {
            let wcount = 0

            let user = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })

            if (user) {
                console.log("njan count", userId);
                let cartCount = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })

                wcount = wcount + cartCount.products.length;
                res(wcount)
            } else {
                res()
            }
        })

    },
    deleteBanner: (BannerId) => {
        return new Promise((res, rej) => {
            db.get().collection(collection.BANNER_COLLECTIONS).deleteOne({ _id: ObjectId(BannerId) }).then((data) => {
                res(data)
            })
        })
    },

    AddFirstSmallBanner:(details)=>{
        console.log(details);
        return new Promise((res,rej)=>{
            db.get().collection(collection.SMALL_BANNER).insertOne(details).then((result)=>
            res(result)
            )
        })
    },
    AddSecondSmallBanner:(details)=>{
        console.log(details);
        return new Promise((res,rej)=>{
            db.get().collection(collection.SMALL_BANNER1).insertOne(details).then((result)=>
            res(result)
            )
        })
    },
    AddThirdSmallBanner:(details)=>{
        console.log(details);
        return new Promise((res,rej)=>{
            db.get().collection(collection.SMALL_BANNER2).insertOne(details).then((result)=>
            res(result)
            )
        })
    },
    AddFourthSmallBanner:(details)=>{
        console.log(details);
        return new Promise((res,rej)=>{
            db.get().collection(collection.SMALL_BANNER3).insertOne(details).then((result)=>
            res(result)
            )
        })
    },
    smallBanner1Find:()=>{
        return new Promise((res, rej) => {
            db.get().collection(collection.SMALL_BANNER).find().toArray().then((result) => {
                res(result)
            })
        })
    },
    smallBanner2Find:()=>{
        return new Promise((res, rej) => {
            db.get().collection(collection.SMALL_BANNER1).find().toArray().then((result) => {
                res(result)
            })
        })
    },
    smallBanner3Find:()=>{
        return new Promise((res, rej) => {
            db.get().collection(collection.SMALL_BANNER2).find().toArray().then((result) => {
                res(result)
            })
        })
    },
    smallBanner4Find:()=>{
        return new Promise((res, rej) => {
            db.get().collection(collection.SMALL_BANNER3).find().toArray().then((result) => {
                res(result)
            })
        })
    },

    deleteSmallBanner:(smallBannerId)=>{
        return new Promise((res, rej) => {
            db.get().collection(collection.SMALL_BANNER).deleteOne({ _id: ObjectId(smallBannerId) }).then((data) => {
                res(data)
            })
    })
},
deleteSmallBanner2:(smallBannerId)=>{
    return new Promise((res, rej) => {
        db.get().collection(collection.SMALL_BANNER1).deleteOne({ _id: ObjectId(smallBannerId) }).then((data) => {
            res(data)
        })
})
},
deleteSmallBanner3:(smallBannerId)=>{
    return new Promise((res, rej) => {
        db.get().collection(collection.SMALL_BANNER2).deleteOne({ _id: ObjectId(smallBannerId) }).then((data) => {
            res(data)
        })
})
},
deleteSmallBanner4:(smallBannerId)=>{
    return new Promise((res, rej) => {
        db.get().collection(collection.SMALL_BANNER3).deleteOne({ _id: ObjectId(smallBannerId) }).then((data) => {
            res(data)
        })
})
},
    addCategoryOffer: (offer) => {


        let category = offer.offerItem
        console.log("category",category);


        return new Promise(async (resolve, reject) => {
            let offerExist = await db.get().collection(collection.CATEGORY_OFFER).findOne(
                { offerItem: category }
            )
            console.log("offer Exist   :", offerExist);
            if (offerExist) {
                resolve({ Exist: true })
            } else {


                db.get().collection(collection.CATEGORY_OFFER).insertOne(offer).then(async (data) => {
                   let activeOffer=await db.get().collection(collection.CATEGORY_OFFER).findOne({_id:data.insertedId})
                   console.log("activeOfferactiveOfferactiveOfferactiveOfferactiveOfferactiveOffer",activeOffer);
                    let Id = activeOffer._id
                    let discount = activeOffer.discount
                    let category =activeOffer.offerItem
                    let validity = activeOffer.validity






                    let items = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([{
                        $match: { $and: [{ category: category }, { offer: false }] }
                    }]).toArray()
                   console.log("itemsitemsitemsitemsitemsitemsitems",items);

                    await items.map(async (product) => {


                        let productPrice = product.price


                        let offerPrice = productPrice - ((productPrice * discount) / 100)
                        offerPrice = parseInt(offerPrice.toFixed(2))
                        let proId = product._id + ""

                        await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                            {
                                _id: ObjectId(proId)

                            },
                            {
                                $set: {
                                    price: offerPrice,
                                    offer: true,
                                    OldPrice: productPrice,
                                    offerPercentage: parseInt(discount)
                                }
                            })
                    })


                    let Item2 = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([{
                        $match: { $and: [{ category: category }, { ProductOffer: true }] }
                    }]).toArray()



                    if (Item2[0]) {

                        await Item2.map(async (product) => {



                            let ProdName = product.name
                            console.log('************************', ProdName, '^^^^^^^^^^^^^^^^^^^^^^^^');
                            proOFF = await db.get().collection(collection.PRODUCT_OFFER).aggregate([
                                {
                                    $match: { items: { $regex: ProdName, $options: 'i' } }
                                }]).toArray()
                            console.log('===============', proOFF[0], '================');
                            let proOffPercentage = parseInt(proOFF[0].discount)

                            console.log('PERCNETAGE OOOOOOOOOOOOOOOOOO', proOffPercentage, 'LLLLL', 'disount', discount);
                            console.log(discount);
                            console.log(proOffPercentage);
                            Discount = parseInt(discount)

                            let BSToFF = proOffPercentage < discount ? discount : proOffPercentage
                            let prize = product.OldPrice
                            let offerrate = prize - ((prize * BSToFF) / 100)
                            console.log(`thisis bst off${BSToFF}`);

                            console.log(BSToFF);
                            // let idfPro = product._id + ""
                            // console.log(idfPro);
                            db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                                {
                                    _id: ObjectId(product._id)

                                },
                                {
                                    $set: {
                                        price: offerrate,
                                        offer: true,
                                        OldPrice: prize,
                                        offerPercentage: parseInt(BSToFF)
                                    }
                                }
                            )


                        })


                    } else {
                    }

                    resolve({ Exist: false })
                })
            }
        })
    },


    // calsdjkldfjl
    getCategoryOffer: () => {
        return new Promise(async (resolve, reject) => {
            let offerList = await db.get().collection(collection.CATEGORY_OFFER).find().toArray()
            resolve(offerList)
        })
    },


    // deleteCategoryOffer: (catOfferId, offerItem) => {

    //     return new Promise(async (res, rej) => {
    //         let productsitems = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
    //             {
    //                 $match: {
    //                     category: offerItem
    //                 }
    //             }

    //         ]).toArray()
    //         console.log(productsitems);
    //         productsitems.map(async (productprice) => {

    //             let price = productprice.OldPrice
    //             let productOffertPrice = productprice.productOffertPrice
    //             let currentRupees = productprice.currentRupees
    //             console.log("***5454*", currentRupees);
    //             let proId = productprice._id + ""
    //             console.log("productprice.name******--*", productprice.name);
    //             let name = productprice.name
    //             let findIsOffer = await db.get().collection(collection.PRODUCT_OFFER).findOne({ "offerDetails.items": name })
    //             console.log("findIsOffer******--*", findIsOffer);
    //             if (findIsOffer) {
    //                 await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
    //                     {
    //                         _id: ObjectId(proId)
    //                     },
    //                     {
    //                         $set: {
    //                             price: productOffertPrice,
    //                             categoryOfferPrice: 0

    //                         }
    //                     }
    //                 )
    //             } else {
    //                 await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(proId) },
    //                     {
    //                         $set: {
    //                             price: currentRupees,
    //                             currentPrice: false,
    //                             offer: false,
    //                             categoryOfferPrice: 0

    //                         }
    //                     })

    //             }


    //             db.get().collection(collection.CATEGORY_OFFER).deleteOne({ _id: ObjectId(catOfferId) }).then((result) => {
    //                 res({ status: true })

    //             })

    //         })   


    //     })
    // },


    deleteCategoryOffer: (offId, category) => {
        // console.log("****5236**categorycategorycategorycategory/",category);


        return new Promise(async (resolve, reject) => {

            let items = await db.get().collection(collection.PRODUCT_COLLECTION)
                .aggregate([{
                    $match: { $and: [{ category: category }, { ProductOffer: false }] }
                }])
                .toArray()
        console.log("****5236**itemsitemsitems/",items);


            await items.map(async (product) => {


                let productPrice = product.OldPrice


                let proId = product._id + ""

                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                    {
                        _id: ObjectId(proId)

                    },
                    {
                        $set: {
                            price: productPrice,
                            offer: false,

                        }
                    })
            })

            let itemforUpdate = await db.get().collection(collection.PRODUCT_COLLECTION)
                .aggregate([{
                    $match: { $and: [{ category: category }, { ProductOffer: true }] }
                }])
                .toArray()
        console.log("****5236**itemsitemsitems/",itemforUpdate);

            if (itemforUpdate[0]) {
                await itemforUpdate.map(async (product) => {

                    let proName = product.name
                    let Off = await db.get().collection(collection.PRODUCT_OFFER).aggregate([{
                        $match: { items: { $regex: proName, $options: 'i' } }
                    }]).toArray()
                    console.log("****5236**OffOffOffOffOff/",Off);
                    let dis = parseInt(Off[0].discount)
                    let prze = product.OldPrice
                    let offerPrice = prze - ((prze * dis) / 100)

                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                        {
                            _id: ObjectId(product._id)

                        },
                        {
                            $set: {
                                price: offerPrice,
                                offer: true,
                                OldPrice: prze,
                                offerPercentage: dis,
                                ProductOffer: true
                            }
                            
                        }
                    )


                })
            }

            db.get().collection(collection.CATEGORY_OFFER).deleteOne({ _id: ObjectId(offId) }).then(async () => {
                resolve()
            })
        })
    },

    // addProductOffer: (offerDetails) => {
    //     return new Promise(async (res, rej) => {
    //         let findExist = await db.get().collection(collection.PRODUCT_OFFER).findOne({ "offerDetails.items": offerDetails.items })
    //         if (findExist) {
    //             db.get().collection(collection.PRODUCT_OFFER).updateOne({ "offerDetails.items": offerDetails.items },
    //                 {
    //                     $set: {
    //                         "offerDetails.validity": offerDetails.validity,
    //                         "offerDetails.discount": offerDetails.discount
    //                     }
    //                 })
    //         } else {
    //             await db.get().collection(collection.PRODUCT_OFFER).insertOne({ offerDetails })
    //         }

    //         let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
    //             {
    //                 $match: {
    //                     name: offerDetails.items
    //                 }
    //             }

    //         ]).toArray()
    //         var prOfferDiscount = parseInt(offerDetails.discount)
    //         await products.map(async (product) => {
    //             console.log("discountPrice*********", discountPrice);
    //             let proId = product._id + "";

    //             if (product.currentPrice) {
    //                 let productPrice = product.currentRupees;
    //                 productPrice = parseInt(productPrice)
    //                 var discountPrice = productPrice - ((productPrice * prOfferDiscount) / 100)
    //                 discountPrice = parseInt(discountPrice.toFixed(2))
    //                 discountPrice =discountPrice > product.categoryOfferPrice ? product.categoryOfferPrice : discountPrice

    //                 db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(proId) },
    //                     {
    //                         $set: {
    //                             offer: true,
    //                             price: discountPrice,
    //                             productOffertPrice: discountPrice
    //                         }
    //                     })
    //             } else {
    //                 let productPrice = product.price;
    //                 productPrice = await parseInt(productPrice)
    //                 var discountPrice = productPrice - ((productPrice * prOfferDiscount) / 100)
    //                 discountPrice = await parseInt(discountPrice.toFixed(2))
    //                 await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
    //                     {
    //                         _id: ObjectId(proId)

    //                     },
    //                     {
    //                         $set: {
    //                             price: discountPrice,
    //                             offer: true,
    //                             currentRupees: productPrice,
    //                             currentPrice: true,
    //                             productOffertPrice: discountPrice,
    //                         }
    //                     })
    //             }



    //             // db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(proId)},
    //             // {
    //             //     $set:{
    //             //         offer:true,
    //             //         price:discountPrice,
    //             //         OldPrice:productPrice
    //             //     }
    //             // })



    //         })
    //         res({ status: true })
    //     })
    // },
    addProductOffer: (offer) => {



        return new Promise(async (resolve, reject) => {

            let Pro = offer.items

            let offerExist = await db.get().collection(collection.PRODUCT_OFFER).aggregate([
                {
                    $match: { items: { $regex: Pro, $options: 'i' } }
                }
            ]

            ).toArray()



            if (offerExist[0]) {

                resolve({ Exist: true })
            } else {

             
                await db.get().collection(collection.PRODUCT_OFFER).insertOne(offer).then(async(data) => {
                    let ins= await db.get().collection(collection.PRODUCT_OFFER).findOne({_id:ObjectId( data.insertedId)})
                    console.log(data);
                    d = ins.discount


                })

                let ProName = offer.items
                productoffer = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                    {
                        $match: { name: { $regex: ProName, $options: 'i' } }
                    }
                ]

                ).toArray()

                let comingPercentage = parseInt(d)

                let activepercentege = productoffer[0].offerPercentage


                let bestOff = comingPercentage < activepercentege ? activepercentege : comingPercentage

                if (productoffer[0].offer) {

                    let price = productoffer[0].OldPrice

                    let offerPrice = price - ((price * bestOff) / 100)

                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                        {
                            name: offer.items
                        },
                        {
                            $set: {
                                OldPrice: price,
                                price: offerPrice,
                                offerPercentage: bestOff,
                                offer: true,
                                ProductOffer: true
                            }
                        })

                } else {
                    let price = productoffer[0].price
                    let offerPrice = price - ((price * comingPercentage) / 100)

                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                        {
                            name: offer.items
                        },
                        {
                            $set: {
                                OldPrice: price,
                                price: offerPrice,
                                offerPercentage: bestOff,
                                offer: true,
                                ProductOffer: true
                            }
                        })


                }

            }
            resolve({ Exist: false })

        })
    },






    // deleteProOffer: (ProOfferId, offerItem) => {
    //     return new Promise(async (res, rej) => {
    //         let productsitems = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
    //             {
    //                 $match: {
    //                     name: offerItem
    //                 }
    //             }

    //         ]).toArray()
    //         console.log("deleted***", productsitems);
    //         productsitems.map(async (productprice) => {
    //             let categoryOfferPrice = productprice.categoryOfferPrice
    //             let currentPrice = productprice.currentRupees
    //             let proId = productprice._id + ""
    //             let findIsOffer = await db.get().collection(collection.CATEGORY_OFFER).findOne({ "data.offerItem": productprice.category })
    //             if (findIsOffer) {
    //                 await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(proId) },
    //                     {
    //                         $set: {
    //                             price: categoryOfferPrice,
    //                             productOffertPrice: 0
    //                         }
    //                     })
    //             } else {
    //                 await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(proId) },
    //                     {
    //                         $set: {
    //                             price: currentPrice,
    //                             currentPrice: false,
    //                             offer: false,
    //                             productOffertPrice: 0

    //                         }
    //                     })

    //             }

    //             await db.get().collection(collection.PRODUCT_OFFER).deleteOne({ _id: ObjectId(ProOfferId) })

    //         })
    //         res({ status: true })
    //     })
    // },
    deleteProOffer: (offId, Product) => {
        return new Promise(async (resolve, reject) => {

            let items = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([{
                $match: { name: Product }
            }]).toArray()


            let productPrice = items[0].OldPrice

            let category = items[0].category
            let proName = items[0].name

            let CateofferExist = await db.get().collection(collection.CATEGORY_OFFER).findOne(
                { offerItem: category }
            )


            if (CateofferExist) {

                let percentage = parseInt(CateofferExist.discount)
                console.log(percentage);

                let price = items[0].OldPrice
                console.log(price);
                let offerPrice = price - ((price * percentage) / 100)
                console.log(offerPrice);

                db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                    {
                        name: proName
                    },
                    {
                        $set: {
                            OldPrice: price,
                            price: offerPrice,
                            offerPercentage: percentage,
                            offer: true,
                            ProductOffer: false
                        }
                    })

                db.get().collection(collection.PRODUCT_OFFER).deleteOne({ _id: ObjectId(offId) }).then(() => {
                    resolve()
                })
            } else {
                let proId = items[0]._id + ""

                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                    {
                        _id: ObjectId(proId)

                    },
                    {
                        $set: {
                            price: productPrice,
                            offer: false,
                            ProductOffer: false

                        }
                    })


                db.get().collection(collection.PRODUCT_OFFER).deleteOne({ _id: ObjectId(offId) }).then(() => {
                    resolve()
                })
            }

        })
    },


    viewOfferPro: () => {
        return new Promise(async (res, rej) => {
            let result = await db.get().collection(collection.PRODUCT_OFFER).find().toArray()
            res(result)
        })
    },
    showAllOrderDetails: () => {
        return new Promise(async (res, rej) => {
            // let orders =await db.get().collection(collection.ORDER_COLLECTION).find().toArray()

            let details = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                $project: {
                    delivaryDetails: 1,
                    userId: 1,
                    product: 1,
                    date: 1
                },
            },
            {
                $unwind: '$product'
            },
            {
                $lookup: {
                    from: collection.USER_COLLECTION,
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'product.items',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'
            }
            ]).toArray()
            console.log(details);
            res(details)
        })
    },
    changeToshipped: (status, orderId, productId) => {
        return new Promise((res, rej) => {
            if (status == 'Delivered') {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId), "product.items": ObjectId(productId) },
                    {
                        $set: {
                            "product.$.productStatus": status,
                            "product.$.Cancel": true
                        }
                    }).then(() => {
                        res({ status: true })
                    })
            } else {

                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId), "product.items": ObjectId(productId) },
                    {
                        $set: {
                            "product.$.productStatus": status
                        }
                    }).then(() => {
                        res({ status: true })
                    })
            }

        })
    },
    getcouponOffer: (couponItems) => {
        console.log("couponItems",couponItems);
        return new Promise(async(res, rej) => {
           let iscoupon=await db.get().collection(collection.COUPON_OFFER).findOne({code:couponItems.code})
           if(iscoupon){
            db.get().collection(collection.COUPON_OFFER).updateOne({code:couponItems.code},
                {
                    $set:{
                        code:couponItems.code,
                        validity:couponItems.validity,
                        discount:couponItems.discount
                    }
                }).then((result)=>{
                    res(result)
                })
                
           }else{
            console.log(couponItems);
            db.get().collection(collection.COUPON_OFFER).insertOne(couponItems).then((result) => {
                res(result)
            })
           }
            
        })
    },
    showCoupon: () => {
        return new Promise(async (res, rej) => {
            let showcoupon = await db.get().collection(collection.COUPON_OFFER).find().toArray()
            res(showcoupon)
        })
    },
    deleteCouponOffer: (couponId, couponName) => {
        return new Promise(async (res, rej) => {
            let delcoupon = await db.get().collection(collection.COUPON_OFFER).deleteOne({ _id: ObjectId(couponId) })
            let delCouponExit = await db.get().collection(collection.COUPON_EXIST).updateOne({ couponCode: couponName },
                {
                    $set: {
                        couponUsed: false
                    }
                })
            res(delcoupon)
        })
    },

    findReport:()=>{
        return new Promise(async(res,rej)=>{
        // let findUserPro=await db.get().collection(collection.USER_COLLECTION).find().toArray()
           let resultPro =await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project:{
                    userId:1,
                    paymentMethod:1,
                    product:1,
                    date:1
                    }
                    
                },
                {
                    $unwind:'$product'
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'product.items',
                        foreignField:'_id',
                        as:"reportUserPro"
                    }
                },
                {

                    $unwind:'$reportUserPro'
                },
                {
                    $lookup:{
                        from:collection.USER_COLLECTION,
                        localField:"userId",
                        foreignField:"_id",
                        as:"userDetails"
                    }
                },
                {

                    $unwind:'$userDetails'
                },
            ]).toArray()
            console.log(resultPro);
      
        res(resultPro)
        })
    },
    DateSearch:(fromDate,toDate)=>{
        console.log("fromDate*********",fromDate);
        console.log("toDate*********",toDate);
        return new Promise(async(res,rej)=>{
           let dateSearch=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        date:fromDate,
                        date:toDate
                    }
                },
                {
                    $project:{
                        product:1,
                        date:1,

                    }
                },
                {
                    $unwind:'$product'
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'product.items',
                        foreignField:'_id',
                        as:'salesReport'
                    }
                },
                {
                    $unwind:'$salesReport'
                },
                {
                    $project: {
                        _id: null,
                     
                       total : { $multiply : ["$salesReport.price",0.1 ] } ,
                         userId:1,
                        paymentMethod:1,
                        product:1,
                        date:1,
                        salesReport:1
                        
                      }
                }

            ]).toArray()
            res(dateSearch)
            
           
        })
    },
    findCurrentMonthSale:(month)=>{
        return new Promise(async(res,rej)=>{
            const today = new Date();
            let fromDate = today.getFullYear() + '' + ( ( month + 1 ) < 10 ? '0' + (month + 1) : ( month + 1 ) )+ '01';
            let toDate = today.getFullYear() + '' + ( ( month + 1 ) < 10 ? '0' + (month + 1) : ( month + 1 ) )+ '31';
            
            fromDate = parseInt(fromDate);
            toDate = parseInt(toDate);

            console.log(fromDate);
           let test= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        $and : [
                            { dateInt: { $gte : fromDate } },
                            { dateInt: { $lte : toDate } }
                        ]
                    },
                },
                {
                    $group: { _id: "$_id", totalQuantity: { $sum: "$total.total" } }
                }
            ]).toArray();
            res(test.length > 0 ? test[0].totalQuantity : 0 );
        })
    },
    findPreviousYearSale:(month)=>{
        return new Promise(async(res,rej)=>{
            const today = new Date();
            let fromDate = today.getFullYear() - 1 + '' + ( ( month + 1 ) < 10 ? '0' + (month + 1) : ( month + 1 ) )+ '01';
            let toDate = today.getFullYear() - 1 + '' + ( ( month + 1 ) < 10 ? '0' + (month + 1) : ( month + 1 ) )+ '31';
            
            fromDate = parseInt(fromDate);
            toDate = parseInt(toDate);

            console.log(fromDate);
           let test= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        $and : [
                            { dateInt: { $gte : fromDate } },
                            { dateInt: { $lte : toDate } }
                        ]
                    },
                },
                {
                    $group: { _id: "$_id", totalQuantity: { $sum: "$total.total" } }
                }
            ]).toArray();
            res(test.length > 0 ? test[0].totalQuantity : 0 );
        })
    },

    thisYearMostUsers:()=>{
        return new Promise(async(res,rej)=>{
            let findHigh=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                 {
                     $project:{
                        product:1,
                     }
                 },
                 {
                    $unwind:'$product'
                },
                 {
                     $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'product.items',
                        foreignField:'_id',
                        as:'productDetail'
                     }
                 },
                 {
                     $unwind:'$productDetail'
                 },
                 {
                     $project : {
                         "productName" : "$productDetail.name",
                         "quantity" : "$product.quantity",
                         "productId" : "$productDetail._id"
                     }
                 },
                 {
                     $group : {
                         _id : {
                             "productName" : "$productName",
                             "productId" : "$productId",
                         },
                         "totalQuantity" : { $sum : "$quantity" }
                     }
                 },
                 {
                     $project : {
                         "_id" : 0,
                         "productName" : "$_id.productName",
                         "quantity" : "$totalQuantity"
                     }
                 }
             ]).toArray();
             let productArr = findHigh.map((elem) => {
                 return elem.productName;
             })
             let quantityArr = findHigh.map((elem) => {
                 return elem.quantity;
             })
             res({productArr, quantityArr});
                // console.log("asyncasyncasync",findHigh);
        })
    },
    thisYearMostCategory:()=>{
        return new Promise(async(res,rej)=>{
            let findMostSellCat=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project:{
                       product:1,
                    }
                },
                {
                    $unwind:'$product'
                },
                {
                    $lookup:{
                       from:collection.PRODUCT_COLLECTION,
                       localField:'product.items',
                       foreignField:'_id',
                       as:'categorytDetail'
                    }
                },
                {
                    $unwind:'$categorytDetail'
                },
                {
                    $project : {
                        "categoryName" : "$categorytDetail.category",
                        "quantity" : "$product.quantity",
                        "productId" : "$categorytDetail._id"
                    }
                },
                {
                    $group : {
                        _id : {
                            "categoryName" : "$categoryName",
                            "productId" : "$productId",
                        },
                        "totalQuantity" : { $sum : "$quantity" }
                    }
                    },
                    {
                        $project : {
                            "_id" : 0,
                            "categoryName" : "$_id.categoryName",
                            "quantity" : "$totalQuantity"
                        }
                    },
                    
            ]).toArray()

            let categoryArr=findMostSellCat.map(elem=>{
                return elem.categoryName
            })
            let uniqueArr = [...new Set(categoryArr)]
            console.log("***");
            console.log(uniqueArr)

            let quantityArr = findMostSellCat.map((elem) => {
                return elem.quantity;
            })
            let uniquequantityArr = [...new Set(quantityArr)]
        
            
            res({uniqueArr,uniquequantityArr})
        })
    }

    
    // changeToDelivered:(orderId)=>{
    //     return new Promise((res,rej)=>{
    //         db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},
    //         {
    //             $set:{
    //                 status:"Delivered"
    //             }
    //         }).then(()=>{
    //             res()
    //         })
    //     })
    // },
    // changeTocancelled:(orderId)=>{
    //     return new Promise((res,rej)=>{
    //         db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},
    //         {
    //             $set:{
    //                 status:"Cancelled"
    //             }
    //         }).then(()=>{
    //             res()
    //         })
    //     })

    // }
}