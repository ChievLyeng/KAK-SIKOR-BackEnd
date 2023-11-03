const Product = require('../models/productModel')
const mongoose = require('mongoose')

// create product
const createProduct = async (req,res) => {

    try{
        const product = await Product.create(req.body)

        res.status(201).json({
            status: 'Success',
            data: {
                product
            }
        });

    }catch(error){
        res.status(400).json({
            status : 'fail',
            message : error
          });
    }
}

// get products
const getProducts = async (req,res) => {

    try{
        const products = await Product.find().sort({createdAt: -1})

        res.status(200).json({
            status: 'Sucess',
            result: products.length,
            data:{
                products
            }
        })
    }catch(error){
        res.status(400).json({
            status : 'fail',
            message : error
          })
    }
}

module.exports = {
    createProduct,
    getProducts
}