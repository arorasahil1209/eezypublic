const Customer = require('../models/customers');
const mongoose = require("mongoose");
var qs = require('qs');
const axios = require('axios');
/* controller to get all customers */
const customerList = async (req, res) => {
    try {
        const getCustomers = await Customer.find()
        .skip(req.query.skip)
        .limit(req.query.limit)
        ;
        console.log('get all customers', getCustomers);
        return res.status(200).json({
            message: 'list of active customers!',
            response: getCustomers,
        });
    } catch (err) {
        console.log("error while listing the customers from db", err)
        return res.status(500).json({
            message: "Not able to get list of customers from db",
            response: err
        })
    };
}

const addCustomer = async (req, res) => {
    try {
        let data = qs.stringify({
            'grant_type': 'authorization_code',
            'code': req.body.spapi_oauth_code,
            'client_id': 'amzn1.application-oa2-client.65458ab2d81f49c3bc62ad0bc728194c',
            'client_secret': '29ae6d6e75d78871f7d2c5ccd913c678a6224e4e3c440117e6a9ac2cb1f705d2',
            'redirect_uri': 'https://my.redirect.example.com',
            'version': 'beta' 
          });
          let config = {
            method: 'post',
            url: 'https://api.amazon.com/auth/o2/token?version=beta',
            headers: { 
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
        };
        let getToken = await axios(config);
        console.log('get token:::',getToken.data.refresh_token);
        console.log("request::",req.body);
       const addNewCustomer= new Customer({
        _id: mongoose.Types.ObjectId(),
        customerId:req.body.customerId,
        customerName:req.body.customerName,
        customerRefreshToken:getToken.data.refresh_token,
        isActive:true
       })
       console.log('addNewCustomer',addNewCustomer)
       let newCustomer = await addNewCustomer.save();
       console.log('new customer::',newCustomer)
       return res.status(200).json({
           message: 'New customer  Created successfully!',
           response: newCustomer,
       });
    } catch (err) {
        console.log("error while creating the customer", err)
        return res.status(500).json({
            message: "Not able to create the customer",
            response: err
        })
    };
}

const deleteCustomer = async (req, res) => {
    try {
       const removeCustomer= await Customer.deleteMany({customerId:req.body.customerId})
       console.log('removeCustomer',removeCustomer)
       return res.status(200).json({
           message: 'customer  removed successfully!',
           response: removeCustomer,
       });
    } catch (err) {
        console.log("error while removing the customer", err)
        return res.status(500).json({
            message: "Not able to remove the customer",
            response: err
        })
    };
}


module.exports = {
    customerList,
    addCustomer,
    deleteCustomer
}