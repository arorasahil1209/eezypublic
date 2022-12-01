const Customer = require('../models/customers');

const mongoose = require("mongoose");
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
        console.log("request::",req.body);
       const addNewCustomer= new Customer({
        _id: mongoose.Types.ObjectId(),
        customerId:req.body.customerId,
        customerName:req.body.customerName,
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