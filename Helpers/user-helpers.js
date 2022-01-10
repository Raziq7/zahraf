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
};
