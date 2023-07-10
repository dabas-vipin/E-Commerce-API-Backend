const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const customError = require('../errors/index')
const {attachCookiesToResponse,createTokenUser} = require('../utils/index')

const register = async (req,res)=>{
     const {name,email,password} = req.body
     const emailExists = await User.findOne({email})
     if(emailExists){
          throw new customError.BadRequestError('Email already exists')
     }
    // First Registered User is an Admin
     const isFirstAccount = (await User.countDocuments({}))=== 0
     const role = isFirstAccount?'admin':'user'
     // create User
     const user = await User.create({name,email,password,role})

     const tokenUser = createTokenUser(user)
     attachCookiesToResponse({res,user:tokenUser})
     
     res.status(StatusCodes.CREATED).json({user:tokenUser})
} 

const login = async (req,res)=>{
     const {email,password}= req.body
     if(!email||!password){
          throw new customError.BadRequestError('please provide email and password')
     }
     const user = await User.findOne({email})
     if(!user){
          throw new customError.UnauthenticatedError('invalid email - no such email is registered')
     }
     const passwordMatches = await user.comparePassword(password)
     if(!passwordMatches){
          throw new customError.UnauthenticatedError('incorrect password')
     }
     const tokenUser = createTokenUser(user)
     attachCookiesToResponse({res,user:tokenUser})

     res.status(StatusCodes.OK).json({user:tokenUser})
}

const logout = async (req,res)=>{
     res.cookie('token','logout',{
          httpOnly:true,
          expires:new Date(Date.now()+1000)  // 1000 denotes miliseconds
     })
     res.status(StatusCodes.OK).json({msg:'logout done'})
}


module.exports = {
     login,
     logout,
     register,
}
