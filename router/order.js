let express = require('express');
const checkAuth = require('../middleware/check-auth');
const {orderList,orderById,syncOrder,syncOrderItems} =  require('../controller/order_controller');
//"mongouri":"mongodb+srv://eezy:admin123@eezy.zppoawf.mongodb.net/eezy?retryWrites=true&w=majority",
let router = express.Router();

router.post('/order-list',checkAuth,orderList)
router.get('/order-detail',checkAuth,orderById)


router.get('/sync-order',syncOrder)

router.get('/sync-order-items',syncOrderItems)
module.exports = router;