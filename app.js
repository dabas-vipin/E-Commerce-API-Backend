// DOTENV
require('dotenv').config()
// express-async-errors
require('express-async-errors')

// router import
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const orderRouter = require('./routes/orderRoutes')

// error handler and 404-not found middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// rest of packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')

// Express
const express = require('express')
const app = express()


// Database
const connectDB = require('./db/connect')

// Middleware
app.use(express.json())
app.use(morgan('tiny'))
app.use(cookieParser(process.env.JWT_SECRET))

app.set('trust proxy',1)
app.use(rateLimiter({
     windowMs:15*60*1000,
     max:60,
}))
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())

app.use(express.static('./public'))
app.use(fileUpload())

// routes
app.get('/',(req,res)=>{
     res.send('Get Route for e commerce api')
})

app.get('/api/v1',(req,res)=>{
     console.log(req.signedCookies)
     res.status(200).json(req.body)
})

app.use('/api/v1/auth/',authRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/products',productRouter)
app.use('/api/v1/reviews',reviewRouter)
app.use('/api/v1/orders',orderRouter)

app.use(errorHandlerMiddleware)
app.use(notFoundMiddleware)


const port = process.env.PORT || 5000

const start = async ()=>{
     try {
          await (await connectDB(process.env.MONGO_URI))
          app.listen(port,console.log(`app is listening on port ${port}`))
     } catch (error) {
          console.log(error)
     }
}

start()