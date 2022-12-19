let spApi = require('../aws-sp-api/spapi');
let Order = require('../models/orders');
let OrderDetail = require('../models/orderDetail');
let Customer = require('../models/customers'); 
let {getAllCustomers,getCustomerById} = require('../Repository/query');

const orderList = async (req, res) => {
    try {
        let query = {
            MarketplaceIds:['A21TJRUUN4KGV'],
            CreatedAfter:'2022-09-01T00:00:00-07:00'
        }
        let customerToken = await getCustomerById(req.query.customerId)
        console.log('customer token::::',customerToken)
        let getOrderLists = await spApi.execute_sp_api('getOrders','orders',null,query,customerToken[0]['customerRefreshToken']);
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
        let arr = [];
        for(let customeritem of getAllCustomerDetails){
        
        let getOrderLists = await spApi.execute_sp_api('getOrders','orders',null,query,customeritem.customerRefreshToken);        
        
        for(let item of getOrderLists.Orders){
            console.log('item::::',item);
            let obj = {
                BuyerEmail :item.BuyerInfo?.BuyerEmail,
                AmazonOrderId:item.AmazonOrderId,
                EarliestDeliveryDate:item.EarliestDeliveryDate,
                EarliestShipDate:item.EarliestShipDate,
                SalesChannel:item.SalesChannel,
                HasAutomatedShippingSettings:item.AutomatedShippingSettings.HasAutomatedShippingSettings,
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
                CustomerId:customeritem.customerId
            }
            arr.push(obj);
        }
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
        console.log('res1::::',res1);
    
        return res.status(200).json({
            message: 'list of active orders!',
            response: arr,
        });
    } catch (err) {
        console.log("error while listing the order from amazon", err)
        return res.status(500).json({
            message: "Not able to get the order lists",
            response: err
        })
    };
}
const syncOrderItems = async (req, res) => {
    let customers = await getAllCustomers();
    console.log('customers::',customers);
    let query = {
        MarketplaceIds:['A21TJRUUN4KGV']
    }
    let arr = [];
    for(let cust of customers){
        let AWSOrderIdOfCustomer = await Order.find({CustomerId:cust.customerId}).select('AmazonOrderId');
        console.log('AWSOrderIdOfCustomer::::',AWSOrderIdOfCustomer);
        console.log('AWSOrderIdOfCustomer length::::',AWSOrderIdOfCustomer.length);
        for(let item of AWSOrderIdOfCustomer){
            let path = {
                orderId:item.AmazonOrderId
            }
            let getOrderDetailById = await spApi.execute_sp_api('getOrderItems','orders',path,query,cust.customerRefreshToken);
            getOrderDetailById.OrderItems[0]['AmazonOrderId']= getOrderDetailById.AmazonOrderId
            arr.push(getOrderDetailById.OrderItems[0]);
        }
    }  
    console.log('arr details::::',arr);

    let detilArr = [];
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
            AmazonOrderId:obj.AmazonOrderId
        } 
        detilArr.push(newObj)
    }
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
    return res.status(200).json({
        message: "Found AWS Ids",
        response: arr
    })
}
module.exports = {
    orderList,
    orderById,
    syncOrder,
    syncOrderItems
}