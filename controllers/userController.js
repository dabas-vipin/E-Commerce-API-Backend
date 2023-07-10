const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const customError = require('../errors/index')
const { createTokenUser,attachCookiesToResponse,checkPermissions } = require('../utils/index')
const getAllUsers = async (req,res)=>{
     console.log(req.user)
     let users = await User.find({role:'user'}).select('-password')
     res.status(StatusCodes.OK).json({users})
}

const getSingleUser = async (req,res)=>{
     const userId = req.params.id 
     const user = await User.findOne({_id:userId}).select('-password')
     if(!user){
          throw new customError.NotFoundError('No user  with given id exists')
     }
     checkPermissions(req.user,user._id)
     res.status(StatusCodes.OK).json({user})
}

const showCurrentUser = async (req,res)=>{
    res.status(StatusCodes.OK).json({user:req.user})
}

// update user using user.save()
const updateUser = async (req,res)=>{
     const {name,email} = req.body 
     if(!email||!name){
      throw new customError.BadRequestError('please provide both name and email')
     }
     const user = await User.findOne({_id:req.user.userId})

     user.name = name
     user.email = email 
     await user.save()

      const tokenUser = createTokenUser(user)
      attachCookiesToResponse({res,user:tokenUser})
      res.status(StatusCodes.OK).json({user:tokenUser}) 
}

// Update User Using findOneAndUpdate
// const updateUser = async (req,res)=>{
//      const {name,email} = req.body 
//      if(!email||!name){
//       throw new customError.BadRequestError('please provide both name and email')
//      }
//      const user = await User.findOneAndUpdate(
//       {_id:req.user.userId},
//       {name,email},{
//       new:true,runValidators:true}
//       )
//       const tokenUser = createTokenUser(user)
//       attachCookiesToResponse({res,user:tokenUser})
//       res.status(StatusCodes.OK).json({user:tokenUser}) 
// }

const updateUserPassword = async (req,res)=>{
     const {oldPassword,newPassword} = req.body
     if(!oldPassword||!newPassword){
          throw new customError.BadRequestError('Please provide both values')
     }
     const user = await findOne({_id:req.user.userId})
     const isPasswordCorrect = await User.comparePassword(oldPassword)
     if(!isPasswordCorrect){
          throw new customError.UnauthenticatedError('Invalid Credentials')
     }
     user.password = newPassword

     await  user.save();
     res.status(StatusCodes.OK).json({msg:'password updated successfully'})
}

module.exports = {
     getAllUsers,
     getSingleUser,
     showCurrentUser,
     updateUser,
     updateUserPassword
}