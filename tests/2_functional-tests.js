const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let likesBefore,likesAfter,stock1_likes,stock2_likes

suite('Functional Tests', function() {
    
    test('Viewing one stock: GET request to /api/stock-prices/' , function(done){
        
        chai.request(server)
        .get('/api/stock-prices')
        .query({
            'stock': 'fb',
            'like': 'false'
        })
        .end(function (err, res) {
            assert.isNull(err,'error should be null')
            assert.equal(res.status,'200','request should succeed')
            assert.isObject(res.body, 'should get json response');
            assert.hasAllKeys(res.body, ['stockData']);
            assert.hasAllDeepKeys(res.body.stockData,['likes','stock','price'])
            // save result for next test
            likesBefore = res.body.stockData.likes
            done()
         });
    })


    test('Viewing one stock and liking it: GET request to /api/stock-prices/' , function(done){
        
        chai.request(server)
        .get('/api/stock-prices/')
        .query({
            'stock': 'fb',
            'like': 'true'
        })
        .end(function (err, res) {
            assert.isNull(err,'error should be null')
            assert.equal(res.status,'200','request should succeed')
            assert.isObject(res.body, 'should get json response');
            assert.hasAllKeys(res.body, ['stockData']);
            assert.hasAllDeepKeys(res.body.stockData,['likes','stock','price'])
            // save value for next test
            likesAfter = res.body.stockData.likes
            assert.isAtLeast(likesAfter,likesBefore)
            done()
         });
    })

    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/' , function(done){
        chai.request(server)
        .get('/api/stock-prices/')
        .query({
            'stock': 'fb',
            'like': 'true'
        })
        .end(function (err, res) {
            assert.isNull(err,'error should be null')
            assert.equal(res.status,'200','request should succeed')
            assert.isObject(res.body, 'should get json response');
            assert.hasAllKeys(res.body, ['stockData']);
            assert.hasAllDeepKeys(res.body.stockData,['likes','stock','price'])
            // like count should not be change
            assert.equal(res.body.stockData.likes,likesAfter)
            done()
         });
    })

    test('Viewing two stocks: GET request to /api/stock-prices/' , function(done){
        chai.request(server)
        .get('/api/stock-prices/')
        .query({
            'stock': ['fb','amzn'],
            'like': 'false'
        })
        .end(function (err, res) {
            assert.isNull(err,'error should be null')
            assert.equal(res.status,'200','request should succeed')
            assert.isObject(res.body, 'should get json response');
            assert.hasAllKeys(res.body, ['stockData']);
            assert.isArray(res.body.stockData)
            // for next test /////////
            let stock = res.body.stockData[0]
            stock1_likes = stock.likes
            stock2_likes = res.body.stockData[1].likes
            // /////////////////////
            assert.isObject(stock)
            assert.hasAllKeys(stock,['stock','likes','rel_likes','price'])
            assert.isNumber(stock.rel_likes)
            done()
         });
    })

    test('Viewing two stocks and liking them: GET request to /api/stock-prices/' , function(done){
        chai.request(server)
        .get('/api/stock-prices/')
        .query({
            'stock': ['fb','amzn'],
            'like': 'true'
        })
        .end(function (err, res) {
            assert.isNull(err,'error should be null')
            assert.equal(res.status,'200','request should succeed')
            assert.isObject(res.body, 'should get json response');
            assert.hasAllKeys(res.body, ['stockData']);
            assert.isArray(res.body.stockData)
            // 
            let stock1updated = res.body.stockData[0]
            let stock2updated = res.body.stockData[0]
            
            assert.isObject(stock1updated)
            assert.hasAllKeys(stock1updated,['stock','likes','rel_likes','price'])
            assert.isNumber(stock1updated.rel_likes)
            // assertion for likes count
            assert.isAtLeast(stock1_likes,stock1updated.likes)
            assert.isAtLeast(stock2_likes,stock2updated.likes)
            done()
         });
    })


});
