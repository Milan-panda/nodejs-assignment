const mongoose=require('mongoose')

const user_schema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profile_img:{
        type:String
    }

});

module.exports=mongoose.model('User',user_schema);