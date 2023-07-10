const express = require('express')
const router = express.Router()
const {
     createProduct,
     getAllProducts,
     getSingleProduct,
     updateProduct,
     deleteProduct,
     uploadImage,
} = require('../controllers/productController')

const {getSingleProductReviews} = require('../controllers/reviewController')

// authentication middleware
const {
     authenticateUser,
     authorizePermissons
}= require('../middleware/authentication')


router.route('/')
.get(getAllProducts)
.post(authenticateUser,authorizePermissons('admin','owner','qa'),createProduct)

// Admin / Owner only routes - this needs to be placed above the :id routes or else uploadImage will be considered as an id in itself
router.route('/uploadImage').post(authenticateUser,authorizePermissons('admin','owner','qa'),uploadImage)

router.route('/:id')
.get(getSingleProduct)
.patch(authenticateUser,authorizePermissons('admin','owner','qa'),updateProduct)
.delete(authenticateUser,authorizePermissons('admin','owner','qa'),deleteProduct)

router.route('/:id/reviews').get(getSingleProductReviews)

module.exports = router
