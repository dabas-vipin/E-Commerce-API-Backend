const { func } = require('joi')
const mongoose = require('mongoose')

const ReviewSchema = mongoose.Schema({
     rating:{
          type:Number,
          min:1,
          max:5,
          required:[true,'Please provide rating'],
     },
     title:{
          type:String,
          trim:true,
          maxlength:100,
          required:[true,'Please provide review title'],
     },
     comment:{
          type:String,
          required:[true,'Please provide review text'],
     },
     user:{
          type:mongoose.Schema.ObjectId,
          ref:'User',
          required:true,
     },
     product:{
          type:mongoose.Schema.ObjectId,
          ref:'Product',
          required:true,
     },
},
  { timestamps:true}
)
// we cant directly use unique validator as even though we may set it there but functionality wont be there
// we need only 1 review per user per product
ReviewSchema.index({product:1,user:1},{unique:true})

ReviewSchema.statics.calculateAverageRating = async function(productId){
     const result = await this.aggregate([
          {
            '$match': {
              product: productId
            }
          }, {
            $group: {
              _id: null, 
              averageRating: {
                $avg: '$rating'
              }, 
              numberOfReviews: {
                $sum: 1
              }
            }
          }
        ])
        console.log(result)
        try {
          await this.model('Product').findOneAndUpdate({_id:productId},{
               averageRating:Math.ceil(result[0]?.averageRating||0),
               numOfReviews:result[0]?.averageRating||0,
          })
        } catch (error) {
          console.log(error);
        }
}

ReviewSchema.post('save',async function(){
     await this.constructor.calculateAverageRating(this.product)
})

ReviewSchema.post('remove',async function(){
     await this.constructor.calculateAverageRating(this.product)
})

module.exports = mongoose.model('Review',ReviewSchema)