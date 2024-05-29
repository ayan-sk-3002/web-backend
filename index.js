const express = require("express");
const port = process.env.PORT;
const app = express();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const multer = require("multer")
const path = require("path")
const cors = require("cors");
const { type } = require("os");
require('dotenv').config()
const baseUrl = `https://nizm-backend.onrender.com`

// MiddleWare 
app.use(express.json());
app.use(cors());



// Connection with Database
mongoose.connect(process.env.MONGO_URL)





// Image Storage Engine

const storage = multer.diskStorage({
    destination:'./upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})


// Endpoint for Image Upload 
app.use('/images',express.static('upload/images'))

app.post('/upload',upload.single('product'),(req,res)=>{
    res.json({
        success:true,
        image_url:`${baseUrl}/images/${req.file.filename}`
    })
})

// Schema for Products
const Product = mongoose.model("Product",{
    id:{
        type:Number,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
})

// Endpoint to Add Product
app.post('/addproduct', async(req,res)=>{
    let products = await Product.find({});
    let _id;
    if(products.length>0){
        let last_array_products = products.slice(-1);
        let last_array = last_array_products[0];
        _id = last_array.id+1;
    }else{
        _id=0;
    }
    const product = new Product({
        id:_id,
        name:req.body.name,
        image:req.body.image,
        description:req.body.description,
        price:req.body.price,
    })
    console.log(product)
    await product.save();
    console.log("saved");
    res.json({
        success:true,
        name:req.body.name,
    })
});

// Endpoint to Delete Products
app.post('/deleteone', async(req,res)=> {
await Product.findOneAndDelete({id:req.body.id})
console.log(req.body.id);
res.json({
    success:true,
    id:req.body.id
})
});

// Endpoint to GET all Products
app.get('/allproducts',async (req,res)=>{
    let products = await Product.find({});
    console.log("got all products");
    res.send(products);                                      

})


app.listen(port,(error)=>{
    if(!error){
        console.log("Server is running on Port: " +port)
    }else{
        console.log(error)
    }
})


