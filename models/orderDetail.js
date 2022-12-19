const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema; 
const Schema = mongoose.Schema;

const orderDetailSchema  = new Schema ({
    _id: mongoose.Schema.Types.ObjectId,
    NumberOfItems:{
        type:String
    },
    ItemTaxCurrencyCode:{
        type:String,
    },
    ItemTaxAmount:{
        type:String,
        required:false
    },
    ItemPriceCurrencyCode:{
        type:String,
        required:false
    },
    ItemPriceAmount:{
        type:String,
        required:false
    },
    ASIN:{
        type:String,
        required:false
    },
    SellerSKU:{
        type:String,
        required:false
    },
    Title:{
        type:String,
        required:false
    },
    SerialNumberRequired:{
        type:Boolean,
        required:false
    },
    IsGift:{
        type:String,
        required:false
    },
    ConditionSubtypeId:{
        type:String,
        required:false
    },
    IsTransparency:{
        type:Boolean,
        required:false
    },
    QuantityOrdered:{
        type:Number,
        required:false
    },
    PromotionDiscountTaxCurrencyCode:{
        type:String,
        required:false
    },
    PromotionDiscountTaxAmount:{
        type:String,
        required:false
    },
    ConditionId:{
        type:String,
        required:false
    },
    PromotionDiscountCurrencyCode:{
        type:String,
        required:false
    },
    PromotionDiscountAmount:{
        type:String,
        required:false
    },
    OrderItemId:{
        type:String,
        required:false,
        unique:true
    },
    AmazonOrderId:{
        type:String,
        required:false,
        unique:true
    },
    QuantityShipped:{
        type:Number,
        required:false
    },
    isActive:{
        type:Boolean,
        required:true,
        default:true
    },
    isDelete:{
        type:Boolean,
        default:false        
    }
});


const OrderDetail = mongoose.model("orderdetail", orderDetailSchema);
module.exports = OrderDetail;