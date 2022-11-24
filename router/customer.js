let express = require('express');
const checkAuth = require('../middleware/check-auth');
const {customerList,addCustomer} =  require('../controller/customer_controller');

let router = express.Router();

router.get('/customer-list',checkAuth,customerList)
router.post('/add-customer',checkAuth, addCustomer);



module.exports = router;