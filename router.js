require("dotenv").config();
const auth_user=require('./authentication')
const express=require('express')
const bcrypt=require('bcrypt')
const router=express.Router()
const mongoose=require('mongoose')
const User=require('./models_reg')
const jwt=require('jsonwebtoken')
const multer=require('multer')


const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'profile_imgs/')
    },
    filename: function(req,file,cb){
        cb(null,file.originalname)
    }
})
// file filter
const fileFilter=(req,file,cb)=>{
    if (file.mimetype==='image/jpeg' || file.mimetype==='image/png'){
        // accepting the file 
        cb(null,true)
    }
    else{
        // regecting files
        cb(null,false)
    }
}
// it gives (req,file,cb) to dict objects given
const upload=multer({storage:storage,limits:{fileSize:1024*1024*5},fileFilter:fileFilter})

router.post('/register',upload.single('profile_img'),(req,res)=>{
    console.log(req.file)
    User.find({email:req.body.email})
    .exec()
    .then(user =>{
        if(user.length>=1){
            return res.status(409).json({
                message:'user already exists with this email'
            })
        }
        else{
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err){
                    return res.status(500).json({
                        error:err
                    })
                }
                else{
                    const user=new User({
                        name:req.body.name,
                        email:req.body.email,
                        mobile:req.body.mobile,
                        password: hash,
                        profile_img:req.file.path
                
                    })
                    user.save().then(result=>{
                        console.log(result)
                        res.status(201).json({
                            message:'user created'
                        })
                    }).catch(err=>{
                        console.log(err)
                        res.status(500).json({
                            error:err
                        })
                    })
                    
                }
            })
        

        }

    })

})

router.post('/login',(req,res)=>{
    User.find({email:req.body.email})
    .exec()
    .then(user=>{
        if(user.length<1){
            return res.status(401).json({
                message:'Auth failed'
            })
        
        }
        else{
            bcrypt.compare(req.body.password,user[0].password,(err,result)=>{
                if(err){
                    console.log(err)
                    return res.status(401).json({
                        message:'Auth failed'})

                }
                if(result){
                const token =jwt.sign({
                        email:user[0].email
                    },process.env.key,{
                        expiresIn:"1h"
                    })
                    console.log(res)
                    return res.status(200).json({message:'loggied in successfully',token:token})
                }
                return res.status(401).json({
                message:'Auth failed'})
                
            })
        }
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error:err
        })
    })
})

router.get('/get_all_users',async (req,res)=>{
    try{
        const users=await User.find().select("name email mobile profile_img")
        res.json(users)
    }
    catch(err){
        res.json(err)
    }
})

router.post('/get_user',auth_user,async (req,res)=>{
    try{
        const user=await User.findOne({email:req.body.email})
        if(user){
            res.json(user)
        }
        else{
            res.json({message:"no user with this mail exists"})
        }
    }
    catch(err){
        res.json(err)
    }
})

//update info
router.patch('/update_info',auth_user,async (req,res)=>{
    try{
        const email=req.query.email;
        console.log(email)
        const user=await User.findOne({email:email})
        console.log(user)
        user.name= req.body.name
        user.email=req.body.email
        user.mobile=req.body.mobile
        user.password=user.password
        console.log(user)
        const response=await user.save()
        res.json(response)
    }catch(err){
        console.log(err)
        res.send('error may u have not updated every field update every field use')
    }
})

router.patch('/reset_password',auth_user,(req,res)=>{
    User.findOne({email:req.body.email})
    .exec()
    .then(user =>{
        if(user==null){
            return res.status(409).json({
                message:'user with this mail does not exists'
            })
        }
        else{
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err){
                    return res.status(500).json({
                        error:err
                    })
                }
                else{
                    user.name=user.name
                    user.email=user.email
                    user.mobile=user.mobile
                    user.password=hash
                    user.save().then(result=>{
                        console.log(result)
                        res.status(201).json({
                            message:'password changed'
                        })
                    }).catch(err=>{
                        console.log(err)
                        res.status(500).json({
                            error:err
                        })
                    })
                    
                }
            })
        

        }

    })

})

router.get('/auth',auth_user,(req,res)=>{
    res.json({message:"your are authorized user to access this application"})
})
    
module.exports=router