const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = mongoose.Schema({
     name:{
          type:String,
          required:[true,'Please provide Name'],
          minlength:3,
          maxlength:50,
          trim:true,
     },
     email:{
          type:String,
          required:[true,'Please provide email'],
          unique:true,
          validate:{
               validator:validator.isEmail,
               maessage:'please provide valid email'
          },
     },
     password:{
          type:String,
          required:[true,'Please provide password'],
          minlength:8,
     },
     role:{
          type:String,
          enum:['admin','user'],
          default:'user',
     }
})

UserSchema.pre('save',async function(){
     // console.log(this.modifiedPaths())
     // console.log(this.isModified('name))
     if(!this.isModified('password')){
          return
     }
     const salt = await bcrypt.genSalt(10)
     this.password = await bcrypt.hash(this.password,salt)
})

UserSchema.methods.comparePassword = async function(candidatePassword){
     const isMatch = await bcrypt.compare(candidatePassword,this.password)
     return isMatch
}


module.exports = mongoose.model('User',UserSchema)