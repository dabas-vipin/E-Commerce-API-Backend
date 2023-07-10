const Order = require('../models/Order')
const Product = require('../models/Product')
const {StatusCodes} = require('http-status-codes')
const customError = require('../errors/index')
const { checkPermissions } = require('../utils/index')

const fakeStripeApi = async({amount,currency})=>{
     const client_secret = 'anyString'
     return {client_secret:client_secret,amount}
}

const createOrder = async(req,res)=>{
     const {items:cartItems,tax,shippingFee}= req.body
     if(!cartItems||cartItems.length<1){
          throw new customError.BadRequestError('No items present in cart')
     }
     if(!tax||!shippingFee){
          throw new customError.BadRequestError('Please provide tax and shipping fee')
     }
     let orderItems =[]
     let subtotal = 0

     for(const item of cartItems){
          const dbProduct = await Product.findOne({_id:item.product})
          if(!dbProduct){
               throw new customError.NotFoundError(
                    `No product exists with id: ${item.product}`
               )
          }
          const {name,price,image,_id} = dbProduct
          const singleOrderItem = {
               amount: item.amount,
               name,
               price,
               image,
               product:_id,
          }
          // add items to order
          orderItems =[...orderItems,singleOrderItem]
          // calculate subtotal
          subtotal += item.amount*price
     }
     // calculate total
     const total = tax+shippingFee+subtotal
     // get client secret - fake stripe payment functionality
     const paymentIntent = await fakeStripeApi({
          amount:total,currency:'inr'
     })
     //console.log(paymentIntent)

     const order = await Order.create({
          orderItems,
          total,
          subtotal,
          tax,
          shippingFee,
          clientSecret:paymentIntent.client_secret,
          user:req.user.userId,
     })
     //console.log(order)

     res.status(StatusCodes.CREATED).json({order,clientSecret:order.client_secret})
}


const getAllOrders = async(req,res)=>{
     const orders = await Order.find({})
     res.status(StatusCodes.OK).json({orders,count:orders.length})
}

const getSingleOrder = async(req,res)=>{
     const {id:orderId} = req.params
     const order = await Order.findOne({_id:orderId})
     if(!order){
          throw new customError.NotFoundError(
               `No order exists with id: ${orderId}`
          )
     }
     checkPermissions(req.user,order.user)
     res.status(StatusCodes.OK).json({order})
}

const getCurrentUserOrders = async(req,res)=>{
     const orders = await Order.findOne({user:req.user.userId})
     res.status(StatusCodes.OK).json({orders})
}

const updateOrder = async(req,res)=>{
     const {id:orderId} = req.params
     const {paymentIntentId} = req.body
     const order = await Order.findOne({_id:orderId})
     if(!order){
          throw new customError.NotFoundError(
               `No order exists with id: ${orderId}`
          )
     }
     checkPermissions(req.user,order.user)
     order.paymentIntentId = paymentIntentId
     order.status = 'paid'
     await order.save()
     
     res.status(StatusCodes.OK).json({order})
}


module.exports = {
     createOrder,
     getAllOrders,
     getSingleOrder,
     getCurrentUserOrders,
     updateOrder,
}