const mongoose=require('mongoose');
const schema=new mongoose.Schema({crop:{type:String,required:true},market:{type:String,required:true},location:String,date:{type:String,required:true},minPrice:Number,maxPrice:Number,modalPrice:{type:Number,required:true,min:0},unit:{type:String,required:true},source:{type:String,required:true},retrievedAt:{type:Date,default:Date.now}},{bufferCommands:false});
schema.index({crop:1,market:1,location:1,date:1,unit:1,source:1},{unique:true});
module.exports=mongoose.model('MarketObservation',schema);
