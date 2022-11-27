// modules
const express=require('express')
const mongoos=require('mongoose')
const url='mongodb://localhost:27017/data_user'
const app=express()
// connecting to mangodb through mongoose which is frontend for mongodb
mongoos.connect(url)
// get the functionalites
const con=mongoos.connection
con.on('open',()=>{
    console.log('connected')
})
// make profile_img folder publicly access to all
app.use(express.static('profile_imgs'))
// use json
app.use(express.json())
// getting the routing file
const routing=require('./router.js')

// if u get request with url start with '/user' forword to routing file
app.use('/user',routing)


app.listen(9000,()=>{
    console.log('started')
})