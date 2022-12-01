let express = require('express');
const checkAuth = require('../middleware/check-auth');
const {orderList,orderById} =  require('../controller/order_controller');
//"mongouri":"mongodb+srv://eezy:admin123@eezy.zppoawf.mongodb.net/eezy?retryWrites=true&w=majority",
let router = express.Router();

router.get('/order-list',checkAuth,orderList)
router.get('/order-detail',checkAuth,orderById)
module.exports = router;