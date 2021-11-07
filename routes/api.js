'use strict';
const axios = require('axios')
const bcrypt = require('bcrypt');
const {Records} = require('../models/record.model')

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get( function (req, res){
    
    const {stock,like} = req.query
    
    // single search
    if(typeof stock==='string'){
      getStockPrice(stock)
      .then(result=>{
          if(result==="Invalid symbol")
            res.json("Invalid symbol")
          else{
            let {latestPrice,symbol} = result
            // update database
            updateDatabase(latestPrice,symbol,like,req.ip)
            .then(data=> res.json(data))
          }
      }) 
    }



    // comparison search
    else if (typeof stock==='object'){

    let firstStock,secondStock

        getStockPrice(stock[0])
          .then( async (result) =>{
            // update database
            if(result!=="Invalid symbol"){
              let {latestPrice,symbol} = result
              let data = await  updateDatabase(latestPrice,symbol,like,req.ip)
              firstStock = data.stockData
            }
            else firstStock={likes:0}
        })
        .then(()=>{
          getStockPrice(stock[1])
          .then( async (result) =>{
            // update database
            if(result!=="Invalid symbol"){

              let {latestPrice,symbol} = result
              let data = await  updateDatabase(latestPrice,symbol,like,req.ip)
              secondStock = data.stockData
            }
            else secondStock={likes:0}
          })
          .then(()=>{
            // perform differance
            let likesDiff = firstStock.likes-secondStock.likes
            
            firstStock.rel_likes =  likesDiff
            secondStock.rel_likes = -1*likesDiff
            res.json({stockData:[firstStock,secondStock]})
            
          })
        })


        .catch(err=> console.log('error occurred',err))
        
    }
})
    
};



async function getStockPrice(stock){
  try {
    let url=`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
    let result = await axios.get(url)

    if(result.data!=="Unknown symbol" && result.data!=="Invalid symbol" && result.data!=="Not found")
      return result.data
    else
      return "Invalid symbol"

  } catch (error) {
    console.log('error in getting stock details ')
  }
}


async function updateDatabase(latestPrice,symbol,like,userIp){

  try {
    let doc = await Records.findOne({sym:symbol})
    if(doc===null){
      // save new doc
      let rc = new Records({sym:symbol})
      let newlyAdded = await rc.save()
      // console.log(newlyAdded)
      return {stockData:{ stock:newlyAdded.sym,price:latestPrice,likes:newlyAdded.likedBy.length }}

    }
    else{
      // liked
      if(like==='true'){
      let updatedDoc = await  Records.findOneAndUpdate({sym:symbol},{
        $addToSet : {likedBy:userIp}
        } , {new:true})

        return {stockData:{ stock:updatedDoc.sym,price:latestPrice,likes:updatedDoc.likedBy.length }}}
        // not liked
      else{
          let foundDoc = await Records.findOne({sym:symbol})
          return {stockData:{ stock:foundDoc.sym,price:latestPrice,likes:foundDoc.likedBy.length }}
      }
    }

  } catch (error) {
    console.log(error)
  }

}