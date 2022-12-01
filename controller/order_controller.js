let spApi = require('../aws-sp-api/spapi');
const orderList = async (req, res) => {
    try {
        let query = {
            MarketplaceIds:['A21TJRUUN4KGV'],
            CreatedAfter:'2022-09-01T00:00:00-07:00'
        }
        let getOrderLists = await spApi.execute_sp_api('getOrders','orders',null,query);
        console.log('getOrderLists:::',getOrderLists);
        return res.status(200).json({
            message: 'list of active orders!',
            response: getOrderLists,
        });
    } catch (err) {
        console.log("error while listing the order from amazon", err)
        return res.status(500).json({
            message: "Not able to get the order lists",
            response: err
        })
    };
}

const orderById = async (req, res) => {
    try {
        let query = {
            MarketplaceIds:['A21TJRUUN4KGV']
        }
        let path = {
            orderId:req.query.orderId
        }
        let getOrderLists = await spApi.execute_sp_api('getOrderItems','orders',path,query);
        console.log('getOrderLists:::',getOrderLists);
        return res.status(200).json({
            message: 'list of active orders!',
            response: getOrderLists,
        });
    } catch (err) {
        console.log("error while listing the order from amazon", err)
        return res.status(500).json({
            message: "Not able to get the order lists",
            response: err
        })
    };
}

module.exports = {
    orderList,
    orderById
}