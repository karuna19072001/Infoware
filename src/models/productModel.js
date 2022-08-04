const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    Shirt: {
        type: String,
        color : {
            enum : ['Red', 'While', 'Grey', 'Blue', 'Black', 'Cream', 'Green']
        },
        size :{
            enum : ['M', 'L', 'XL']
        }
    },

    TShirt: {
        type: String,
        color : {
            enum : ['Red', 'While', 'Grey', 'Blue', 'Black', 'Cream', 'Green']
        },
        size :{
            enum : ['M', 'L', 'XL']
        }
    },

    price : {
        type: Number,
    },

    deletedAt: {
        type: Date,
        default: null
    },

    isDeleted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
})

module.exports = mongoose.model('Product', productSchema)