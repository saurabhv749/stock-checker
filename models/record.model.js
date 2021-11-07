const mongoose = require('mongoose')


let recordSchema = new mongoose.Schema({
  sym:{type:String,unique:true},
  likedBy:{type:[String],default:[]}
})


let Records =  mongoose.model('user',recordSchema)

module.exports = {Records}