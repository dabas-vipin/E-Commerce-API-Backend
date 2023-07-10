const customError = require('../errors/index')
const {isTokenValid} = require('../utils/index')

const authenticateUser = async (req,res,next)=>{
     const token = req.signedCookies.token
     if(!token){
          throw new customError.UnauthenticatedError('Authentication failed')     
     }
     try {
          const payload =  isTokenValid({token})
          req.user = {name:payload.name,userId:payload.userId,role:payload.role}
          next() 
     } catch (error) {
          throw new customError.UnauthenticatedError('Authentication failed')          
     }
}

const authorizePermissons = (...roles)=>{
     return async (req,res,next)=>{
     if(!roles.includes(req.user.role)){
          throw new customError.UnauthorizedError('Unauthorised to access this route')
     }
     next();
}
}


module.exports = {
     authenticateUser,
     authorizePermissons
}