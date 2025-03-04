const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const {storage}= require("./cloudinary")
const multer =require("multer");
const upload= multer({storage})
// const upload= multer({dest:"uploads/"})

dotenv.config(); 

const app = express();


// MongoDB Connection

const MONGO_URI = process.env.VERCEL_ENV === 'production' ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_PROD;

// MongoDB Connection

// const MONGO_URI = process.env.VERCEL_ENV === 'production' 
//     ? process.env.MONGO_URI_PROD 
//     : process.env.MONGO_URI_DEV;



// **Check if MongoDB URI is Available**
if (!MONGO_URI) {
    console.error("❌ MongoDB URI is missing! Check your .env file.");
    process.exit(1); 
}


console.log("✅ Using MongoDB URI:", MONGO_URI);

// **Connect to MongoDB**
mongoose.connect(MONGO_URI, { dbName: 'vehiclesDB' })
.then(() => {
    console.log("✅ Connected to MongoDB successfully!");
}).catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); 
});

const VehicleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true } ,
    images:[
        {
            url:String,
            filename:String
        }
    ],
});

const Vehicle = mongoose.model("Vehicle", VehicleSchema);


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Ensure JSON data parsing


app.get("/", (req, res) => {
    res.render("index", { name: null, email: null, image: null }); // ✅ Ensure image is always defined
});


// app.post("/show",upload.single("image"), async (req, res) => {
//     const { name, email } = req.body;
//     console.log(" Received Data:", req.body); 
//     try {
//         if (!name || !email) {
//             return res.status(400).send(" Name and email are required!");
//         }

//         const image = req.file ? { url: req.file.path, filename: req.file.filename } : null;
//         await mongoose.connection.db.collection("vehicles").drop();
//         const updatedUser = await Vehicle.findOneAndUpdate(
//             { email: email },  // 🔍 Find user by email
//             { $set: { name: name } },  // 📝 Update name while keeping other fields
//             { new: true, upsert: true } // ⚙️ Return updated record, insert if missing
//         );


//     console.log(req.body,req.file)

    

        
//         console.log("✅ Updated User:", updatedUser);
        

//         res.render("index", { 
//             name: updatedUser.name, 
//             email: updatedUser.email, 
//             image: image 
//         });

//     } catch (err) {
//         console.error("Error updating data:", err);
//         res.status(500).send("Error updating data.");
//     }
// });


app.post("/show", upload.single("image"), async (req, res) => {
    const { name, email } = req.body;
    console.log("Received Data:", req.body); 

    try {
        if (!name || !email) {
            return res.status(400).send("Name and email are required!");
        }

        // Ensure an image was uploaded
        const image = req.file ? { url: req.file.path, filename: req.file.filename } : null;

        // Update or insert user, and push image to 'images' array
        const updatedUser = await Vehicle.findOneAndUpdate(
            { email: email },  
            { 
                $set: { name: name },  
                $push: { images: image } // ✅ Store image in 'images' array
            },  
            { new: true, upsert: true } 
        );

        console.log("✅ Updated User:", updatedUser);

        res.render("index", { 
            name: updatedUser.name, 
            email: updatedUser.email, 
            image: image 
        });

    } catch (err) {
        console.error("Error updating data:", err);
        res.status(500).send("Error updating data.");
    }
});


// **Start Server**
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});


