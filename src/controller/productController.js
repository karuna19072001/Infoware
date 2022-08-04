const productModel = require('../models/productModel')
const validate = require('../validator/validators')
const aws = require('../validator/awsS3')


/********************** CREATE PRODUCT *************************/

const createProduct = async (req, res) => {
    try {

        if (!validate.isValidRequestBody(req.body)) {
            return res.status(400).send({
                status: false,
                message: `invalid request params`
            })
        }

        let {
            Shirt,
            TShirt,
            price
        } = req.body


        if (!validate.isvalidSize(Shirt.size)) {
            return res.status(400).send({
                status: false,
                message: `Size is not available`
            })
        }

        if (!validate.isValidColor(Shirt.color)) {
            return res.status(400).send({
                status: false,
                message: `Color is not available`
            })
        }

        if (!validate.isvalidSize(TShirt.size)) {
            return res.status(400).send({
                status: false,
                message: `Size is not available`
            })
        }

        if (!validate.isValidColor(TShirt.color)) {
            return res.status(400).send({
                status: false,
                message: `Color is not available`
            })
        }


        if (!validate.isValidNumber(parseInt(price))) {
            return res.status(400).send({
                status: false,
                message: `price attribute should be Number/ decimal Number Only`
            })
        }

        let finalData = {
            Shirt,
            TShirt,
            price
        }

        const newProduct = await productModel.create(finalData)
        return res.status(201).send({
            status: true,
            message: 'Success',
            Data: newProduct
        })

    } catch (err) {
        return res.status(500).send({
            status: false,
            message: err.message
        })
    }
}



/******************************GET PRODUCT******************************/

const getProduct = async function (req, res) {
    try {
        const queryParams = req.query
        const body = req.body

        if (validate.isValidRequestBody(body)) {
            return res.status(400).send({
                status: false,
                message: `Don't you understand about query params`
            })
        }

        const {
            name,
            priceGreaterThan,
            priceLessThan,
            priceSort,
            size
        } = queryParams

        const product = {}

        if (size) {

            const searchSize = await productModel.find({
                availableSizes: size,
                isDeleted: false
            }).sort({
                price: priceSort
            })

            if (searchSize.length !== 0) {
                return res.status(200).send({
                    status: true,
                    message: 'Success',
                    data: searchSize
                })
            } else {
                return res.status(400).send({
                    status: false,
                    message: `product not found with this ${size}`
                })
            }
        }

        if (name) {
            const searchName = await productModel.find({
                title: {
                    $regex: name
                },
                isDeleted: false
            }).sort({
                price: priceSort
            })

            if (searchName.length !== 0) {
                return res.status(200).send({
                    status: true,
                    message: 'Success',
                    data: searchName
                })
            } else {
                return res.status(400).send({
                    status: false,
                    message: `product not found with this ${name}`
                })
            }
        }

        if (priceGreaterThan) {
            product["$gt"] = priceGreaterThan
        }

        if (priceLessThan) {
            product["$lt"] = priceLessThan
        }

        if (priceLessThan || priceGreaterThan) {
            const searchPrice = await productModel.find({
                price: product,
                isDeleted: false
            }).sort({
                price: priceSort
            })

            if (searchPrice.length !== 0) {
                return res.status(200).send({
                    status: true,
                    message: 'Success',
                    data: searchPrice
                })
            } else {
                return res.status(400).send({
                    status: false,
                    message: 'product not found with this range'
                })
            }
        }

        const Products = await productModel.find({
            data: product,
            isDeleted: false
        }).sort({
            price: priceSort
        })
        if (Products !== 0) {
            return res.status(200).send({
                status: true,
                message: 'Success',
                count: Products.length,
                data: Products
            })
        } else {
            return res.status(404).send({
                status: false,
                message: 'No product exist in database'
            })
        }
    } catch (error) {
        res.status(500).send({
            status: false,
            error: error.message
        })
    }
}




/**************************** UPDATE PRODUCT BY ID **********************************/

const updateProductById = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/.test(productId.trim()))) {
            return res.status(400).send({
                status: false,
                message: 'Please provide valid product id in Params'
            })
        }

        let product = await productModel.findOne({
            _id: productId,
            isDeleted: false
        });
        if (!product) {
            return res.status(400).send({
                status: false,
                message: `Provided ProductId ${productId} Does not exists`
            })
        }

        let updateBody = req.body

        let{
             price
        } = updateBody



        if (!validate.isValidRequestBody(updateBody)) {
            return res.status(400).send({
                status: false,
                message: 'Please, provide some data to update'
            })
        }



        if (!validate.validString(price)) {
            return res.status(400).send({
                status: false,
                message: 'price cannot be empty'
            })
        }

        if (Number(price) <= 0) {
            return res.status(400).send({
                status: false,
                message: 'Price should be a valid number'
            })
        }

        if (!validate.validString(isFreeShipping)) {
            return res.status(400).send({
                status: false,
                message: 'isFreeShipping cannot be empty'
            })
        }


        

        let updatedProduct = await productModel.findOneAndUpdate({
            _id: productId
        }, {
            $set: {
                price : price
            }
        }, {
            new: true
        })
        return res.status(201).send({
            status: true,
            product: updatedProduct
        })
    } catch (error) {
        return res.status(500).send({
            status: false,
            error: error.message
        })
    }
}



/**************************** GET PRODUCT BY ID ********************************/

const getProductById = async function (req, res) {
    try {
        let pid = req.params.productId
        if (!validate.isValidObjectId(pid)) {
            return res.status(400).send({
                Status: false,
                msg: "Please provide valid Product id"
            })

        }

        let product = await productModel.findById(pid)
        if (!product) {
            return res.status(404).send({
                Status: false,
                msg: "No product with this id exists"
            })
        }

        if (product.isDeleted === true) {
            return res.status(400).send({
                Status: false,
                msg: "Product is deleted"
            })
        }


        return res.status(200).send({
            Status: true,
            message: "Success",
            Data: product
        })



    } catch (err) {
        return res.status(500).send({
            Status: false,
            msg: err.message
        })
    }

}


/************************ DELETE PRODUCT BY ID **************************/

const deleteProductById = async function (req, res) {
    try {
        let pid = req.params.productId
        if (!validate.isValidObjectId(pid)) {
            return res.status(400).send({
                Status: false,
                msg: "Please provide valid Product id"
            })
        }


        let product = await productModel.findById(pid)

        if (!product) {
            return res.status(404).send({
                Status: false,
                msg: "Product not found"
            })
        }

        if (product.isDeleted === true) {
            return res.status(400).send({
                Status: false,
                msg: "Product already deleted"
            })
        }


        let deletedProduct = await productModel.findByIdAndUpdate(pid, {
            $set: {
                isDeleted: true,
                deletedAt: Date.now()
            }
        }, {
            new: true
        })

        return res.status(200).send({
            Status: true,
            message: "Success",
            Data: deletedProduct
        })


    } catch (err) {
        return res.status(500).send({
            Status: false,
            msg: err.message
        })
    }

}


module.exports = {
    createProduct,
    getProduct,
    updateProductById,
    getProductById,
    deleteProductById
}