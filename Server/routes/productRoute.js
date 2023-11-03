const express = require('express')
const {
    createProduct,
    getProducts
} = require('../controller/productController')

const router = express.Router()

// create product
router.post('/upload',createProduct);

// get product
router.get('/products',getProducts)

module.exports = router