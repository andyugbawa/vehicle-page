const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt")
const dotenv = require("dotenv");
const {storage}= require("./cloudinary")
const multer =require("multer");
const upload= multer({storage})
const session = require("express-session");
const MongoStore = require("connect-mongo");
// const upload= multer({dest:"uploads/"})

// dotenv.config(); 

const app = express();




// MongoDB Connection

// const MONGO_URI = process.env.VERCEL_ENV === 'production' ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_PROD;

// MongoDB Connection

const MONGO_URI = process.env.VERCEL_ENV === 'production' 
    ? process.env.MONGO_URI_PROD 
    : process.env.MONGO_URI_DEV;



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




const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const User = mongoose.model("User", userSchema);


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Ensure JSON data parsing

app.use(
    session({
        secret: "yourSecretKey",  // Change this to a secure key
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: MONGO_URI }), // Store sessions in MongoDB
        cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day expiry
    })
);



function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next(); // User is authenticated
    }
    res.redirect("/login"); // Redirect if not logged in
}
app.get("/", isAuthenticated, (req, res) => {
    res.render("index", { 
        name: req.session.user.username, 
        email: req.session.user.email || null, // ✅ Include email (default to null if missing)
        image: null
    });
});




app.get("/", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    res.render("index", { 
        name: req.session.user.username, // ✅ Show logged-in user
        email: req.session.user.email || null,
        image: null
    });
    res.render("index", { name: null, email: null, image: null });
});




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
        await mongoose.connection.db.collection("vehicles").drop();
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



app.get("/login",(req,res)=>{
    res.render("login")
})

app.post("/login",async(req,res)=>{
    const {username,password}=req.body;
    const user  = await User.findOne({username});

    if(!user){
        return res.redirect("/register")
        
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if(validPassword){
        req.session.user = user;
       res.redirect("/")
    }else{
        res.redirect("/login")
    }
    
})



app.get("/register",(req,res)=>{
    res.render("register")
})

app.post("/register", async(req,res)=>{
   const {password,username} =req.body;
   const hash = await bcrypt.hash(password,12) ;
   const user = new User({
       username,
       password:hash
   })
   await user.save();
   res.redirect("/")
})

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login"); // Redirect to login after logout
    });
});



// **Start Server**
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});


