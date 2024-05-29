const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000; // Ensure a default port is provided
const baseUrl = `https://nizm-backend.onrender.com`;

// MiddleWare 
app.use(express.json());
app.use(cors());

// Connection with Database
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Database connected"))
    .catch(err => console.error("Database connection error:", err));

// Ensure upload directory exists
const fs = require('fs');
const uploadDir = './upload/images';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Image Storage Engine
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Endpoint for Image Upload 
app.use('/images', express.static(uploadDir));

app.post('/upload', upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    res.json({
        success: true,
        image_url: `${baseUrl}/images/${req.file.filename}`
    });
});

// Schema for Products
const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Product = mongoose.model("Product", productSchema);

// Endpoint to Add Product
app.post('/addproduct', async (req, res) => {
    try {
        let products = await Product.find({});
        let _id = products.length > 0 ? products.slice(-1)[0].id + 1 : 0;

        const product = new Product({
            id: _id,
            name: req.body.name,
            image: req.body.image,
            description: req.body.description,
            price: req.body.price
        });

        await product.save();
        res.json({
            success: true,
            name: req.body.name,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to Delete Products
app.post('/deleteone', async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: req.body.id });
        res.json({
            success: true,
            id: req.body.id
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to GET all Products
app.get('/allproducts', async (req, res) => {
    try {
        let products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, (error) => {
    if (!error) {
        console.log("Server is running on Port: " + port);
    } else {
        console.log(error);
    }
});
