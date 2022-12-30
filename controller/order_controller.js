let spApi = require('../aws-sp-api/spapi');
let Order = require('../models/orders');
let OrderDetail = require('../models/orderDetail');
let Customer = require('../models/customers'); 
let fs = require('fs'); 
let {getAllCustomers,getCustomerById} = require('../Repository/query');
let orderArray = [];
const orderList = async (req, res) => {
    try {
        let query = {
            MarketplaceIds:['A21TJRUUN4KGV'],
            CreatedAfter:'2022-09-01T00:00:00-07:00', 
        }
        console.log('body token:::',req.body);
        if(req.body?.NextToken){
            query.NextToken = req.body.NextToken
        }
        let customerToken = await getCustomerById(req.query.customerId)
        let getOrderLists = await spApi.execute_sp_api('getOrders','orders',null,query,customerToken[0]['customerRefreshToken']);
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
        let customerToken = await getCustomerById(req.query.customerId);
        console.log('customer token::::',customerToken);

        let getOrderLists = await spApi.execute_sp_api('getOrderItems','orders',path,query,customerToken[0]['customerRefreshToken']);
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


const syncOrder = async (req, res) => {
    try {
        let query = {
            MarketplaceIds:['A21TJRUUN4KGV'],
            CreatedAfter:'2022-09-01T00:00:00-07:00'
        }
        let getAllCustomerDetails = await Customer.find({})
        for(let customeritem of getAllCustomerDetails){
            console.log('starting for customer::::',customeritem.customerId)
            await getAllOrderDataPagination(query,customeritem.customerRefreshToken,customeritem.customerId)
            await putOrderDataInDb(orderArray.flat())
            orderArray=[];
        }
        return res.status(200).json({
            message: 'list of active orders!',
           arr:orderArray
        });
    } catch (err) {
        console.log("error while listing the order from amazon", err)
        return res.status(500).json({
            message: "Not able to get the order lists",
            response: err
        })
    };
}

async function getAllOrderDataPagination(query,token,customerId){
    console.log('check paginitation',customerId);
    let getOrderLists = await spApi.execute_sp_api('getOrders','orders',null,query,token);
    console.log('getOrderLists:::',getOrderLists);
    orderArray.push(getOrderLists.Orders)
    orderArray = orderArray.flat();
    // orderArray.map(o => o.customerId = customerId)
    console.log('Fine Data::::',orderArray.flat())
    if(!getOrderLists?.NextToken){
        orderArray.map(o => o.customerId = customerId)
        console.log('returning as no token',orderArray.flat())
        return orderArray;
    }else{
        console.log('creating query:::');
        query.NextToken  = getOrderLists.NextToken;
        await getAllOrderDataPagination(query,token,customerId)  
    }
}

async function putOrderDataInDb(data){
    let arr = [];
    console.log('data length :::',data.length);
    console.log('data is :::',data);
    for(let item of data){
        let obj = {
            BuyerEmail :item.BuyerInfo?.BuyerEmail,
            AmazonOrderId:item.AmazonOrderId,
            EarliestDeliveryDate:item.EarliestDeliveryDate,
            EarliestShipDate:item.EarliestShipDate,
            SalesChannel:item.SalesChannel,
            HasAutomatedShippingSettings:item.AutomatedShippingSettings?.HasAutomatedShippingSettings,
            OrderStatus:item.OrderStatus,
            IsPremiumOrder:item.IsPremiumOrder,
            IsPrime:item.IsPrime,
            FulfillmentChannel:item.FulfillmentChannel,
            NumberOfItemsUnshipped:item.NumberOfItemsUnshipped,
            HasRegulatedItems:item.HasRegulatedItems,
            IsReplacementOrder:item.IsReplacementOrder,
            IsSoldByAB:item.IsSoldByAB,
            LatestShipDate:item.LatestShipDate,
            ShipServiceLevel:item.ShipServiceLevel,
            DefaultShipFromLocAddressLine2:item.DefaultShipFromLocationAddress?.AddressLine2 || null,
            DefaultShipFromLocStateOrRegion:item.DefaultShipFromLocationAddress?.StateOrRegion || null,
            DefaultShipFromLocAddressLine1:item.DefaultShipFromLocationAddress?.AddressLine1 || null,
            DefaultShipFromLocPostalCode:item.DefaultShipFromLocationAddress?.PostalCode || null,
            DefaultShipFromLocCity:item.DefaultShipFromLocationAddress?.City || null,
            DefaultShipFromLocCountryCode:item.DefaultShipFromLocationAddress?.CountryCode || null,
            DefaultShipFromLocName:item.DefaultShipFromLocationAddress?.Name || null,
            IsISPU:item.IsISPU,
            MarketplaceId:item.MarketplaceId,
            LatestDeliveryDate:item.LatestDeliveryDate,
            PurchaseDate:item.PurchaseDate,
            ShippingAddressStateOrRegion:item.ShippingAddress?.StateOrRegion || null,
            ShippingAddressPostalCode:item.ShippingAddress?.PostalCode || null,
            ShippingAddressCity:item.ShippingAddress?.City || null,
            ShippingAddressCountryCode:item.ShippingAddress?.CountryCode || null,
            IsAccessPointOrder:item.IsAccessPointOrder,
            PaymentMethod:item.PaymentMethod,
            IsBusinessOrder:item.IsBusinessOrder,
            OrderTotalCurrencyCode:item.OrderTotal?.CurrencyCode || null,
            OrderTotalAmount:item.OrderTotal?.Amount || 'NOT PAID',
            EasyShipShipmentStatus:item.EasyShipShipmentStatus,
            IsGlobalExpressEnabled:item.IsGlobalExpressEnabled,
            LastUpdateDate:item.LastUpdateDate,
            ShipmentServiceLevelCategory:item.ShipmentServiceLevelCategory,
            CustomerId:item.customerId
        }
        arr.push(obj);
    }
    for (let i in arr) {
        arr[i] = {
          updateOne: {
            filter: {AmazonOrderId: arr[i].AmazonOrderId},
            update: arr[i],
            upsert: true
          }
        }
    } 
    const res1 = await Order.bulkWrite(arr);
  //  orderArray = [];
    return res1
}
const syncOrderItems = async (req, res) => {
    let customers = await getAllCustomers();
    console.log('customers::',customers);
    let query = {
        MarketplaceIds:['A21TJRUUN4KGV']
    }
    let arr = [];
    for(let cust of customers){
        let orders = await Order.find({CustomerId:cust.customerId}).select('AmazonOrderId');
        let OrderDetails = await OrderDetail.find({CustomerId:cust.customerId}).select('AmazonOrderId');

        let orderArr = orders.map(e => e.AmazonOrderId)

        let OrderDetailArr = OrderDetails.map(e => e.AmazonOrderId)

        let AWSOrderIdOfCustomer = orderArr.filter(function(obj) { return OrderDetailArr.indexOf(obj) == -1; });

        

        //let AWSOrderIdOfCustomer = await Order.find({CustomerId:cust.customerId}).select('AmazonOrderId');
        console.log('AWSOrderIdOfCustomer::::',AWSOrderIdOfCustomer);
        console.log('AWSOrderIdOfCustomer length::::',AWSOrderIdOfCustomer.length); 
        if(AWSOrderIdOfCustomer.length > 0){
        for(let item of AWSOrderIdOfCustomer){
            console.log('item:::',item);
            let path = {
                orderId:item //item.AmazonOrderId
            }
            console.log('refresh token::',query);
            let getOrderDetailById = await spApi.execute_sp_api('getOrderItems','orders',path,query,cust.customerRefreshToken);            
            console.log('getOrderDetailById:::',getOrderDetailById);
            if(getOrderDetailById){
            getOrderDetailById.OrderItems[0]['AmazonOrderId']= getOrderDetailById.AmazonOrderId
            getOrderDetailById.OrderItems[0]['CustomerId']= cust.customerId
            arr.push(getOrderDetailById.OrderItems[0]);
            }
        }
    }
    
    console.log('arr details::::',arr);

    let detilArr = [];
    if(arr.length > 0){
    for(let obj of arr){
        let newObj={
            NumberOfItems:obj.ProductInfo.NumberOfItems,
            ItemTaxCurrencyCode:obj.ItemTax?.CurrencyCode || null,
            ItemTaxAmount:obj.ItemTax?.Amount ||null,
            ItemPriceCurrencyCode:obj.ItemPrice?.CurrencyCode || null,
            ItemPriceAmount:obj.ItemPrice?.Amount || null,
            ASIN:obj.ASIN,
            SellerSKU:obj.SellerSKU,
            Title:obj.Title,
            SerialNumberRequired:obj.SerialNumberRequired,
            IsGift:obj.IsGift,
            ConditionSubtypeId:obj.ConditionSubtypeId,
            IsTransparency:obj.IsTransparency,
            QuantityOrdered:obj.QuantityOrdered,
            PromotionDiscountTaxCurrencyCode:obj.PromotionDiscountTax?.CurrencyCode || null,
            PromotionDiscountTaxAmount:obj.PromotionDiscountTax?.Amount || 'NOT PAID',
            ConditionId:obj.ConditionId,
            PromotionDiscountCurrencyCode:obj.PromotionDiscount?.CurrencyCode || null,
            PromotionDiscountAmount:obj.PromotionDiscount?.Amount || null,
            OrderItemId:obj.OrderItemId,
            AmazonOrderId:obj.AmazonOrderId,
            CustomerId:obj.CustomerId
        } 
        detilArr.push(newObj)
    }
}
if(detilArr.length > 0){
    for (let i in detilArr) {
        detilArr[i] = {
          updateOne: {
            filter: {AmazonOrderId: detilArr[i].AmazonOrderId},
            update: detilArr[i],
            upsert: true
          }
        }
    } 
    const res1 = await OrderDetail.bulkWrite(detilArr);
    console.log('res1::::',res1);
}
 
}
return res.status(200).json({
    message: "Sync updated", 
})    
}

module.exports = {
    orderList,
    orderById,
    syncOrder,
    syncOrderItems
}