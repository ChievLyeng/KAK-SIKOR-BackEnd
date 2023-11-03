const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    p_Name:{
        type: String,
        required: [true, "Product mush have a name"],
        trim: true,
        unique: true
    },
    p_Type: {
        type: String,
        enum: {
            values: ['Fresh','Organic'],
            message: 'Difficulty is either: Fresh,Organic'
        }
    },
    p_Price: {
        type: Number,
        required: [true,"Product must have a price"]
    },
    dis_Price: {
        type: Number,
        validate: {
            validator: function(val){
                return val < this.p_Price; 
            },
            message: 'Discount price (${VALUE}) should be below regular price' 
        }
    },
    p_Image:{
        data: Buffer,
        contentType: String,
    },
    Quantity: {
        type: Number,
        validate: {
            validator: function (value) {
              // Regular expression to match decimal numbers
              return /^\d+(\.\d+)?$/.test(value);
            },
            message: 'Quantity should be decimal number.'
          },
        required: [true,'Producte must have quantity']
    },
    Supplier: {
        type: String,
        required: true
    },
    Origin:{
        type: String,
        required: true
    },
    Nutrition_Fact: {
        type: String
    },
    Description: {
        type: String
    },
    Other: {
        type: String
    }
    
},{ timestamps : true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true} });

module.exports = mongoose.model('Products',productSchema)



