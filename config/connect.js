const MongoClient=require('mongodb').MongoClient
const dotenv = require('dotenv');
dotenv.config()
const state={
    db:null
}
module.exports.connect=(done)=>{
    const url=`mongodb+srv://Raziq:${process.env.MONGO_PASS}@zahraf.bb5ow.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
    const dbname='zahraf'

    MongoClient.connect(url,(err,data)=>{
        if(err)return done(err)
        state.db=data.db(dbname)
        done()
    })
}   
module.exports.get=function(){
    return state.db
}
