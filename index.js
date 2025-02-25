// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const path = require("path");
// const dotenv = require("dotenv");
// dotenv.config();




// const MONGO_URI = process.env.NODE_ENV === "production" 
//     ? process.env.MONGODB_URI_PROD 
//     : process.env.MONGODB_URI_DEV;


//     if (!MONGO_URI) {
//         console.error("MongoDB URI is missing! Check your environment variables.");
//         process.exit(1); // Exit process if URI is missing
//     }
    
//     // **Connect to MongoDB Once**
//     mongoose.connect(MONGO_URI, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     }).then(() => {
//         console.log(`Connected to MongoDB: ${MONGO_URI}`);
//     }).catch(err => {
//         console.error("MongoDB Connection Error:", err);
//         process.exit(1); // Exit on connection error
//     });


// const  VehicleSchema = new mongoose.Schema({
//     name: { type: String, required: true },  
//     email: { type: String, required: true }
// })

// const Vehicle = mongoose.model("Vehicle",VehicleSchema)

// console.log("MONGO_URI:", MONGO_URI);


// app.set("views",path.join(__dirname,"views"));
// app.set("view engine","ejs");
// app.use(express.urlencoded({extended:true}));
// app.use(express.json());



// app.get("/",(req,res)=>{
//     res.render("index")
// })



// app.post("/show", async (req, res) => {
//     const { name, email } = req.body;

//     console.log("Received Data:", req.body); // Debugging: Check what data is received

//     try {
//         if (!name || !email) {
//             return res.status(400).send("Name and email are required!");
//         }

//         const newUser = new Vehicle({ name, email });
//         await newUser.save();
//         res.send("Data saved successfully!");
//     } catch (err) {
//         console.error("Error saving data:", err);
//         res.status(500).send("Error saving data.");
//     }
// });



// app.listen(4001,()=>{
//     console.log("LISTEN TO APP 4001")
// })


const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const app = express();

// **Determine MongoDB URI Based on Environment**
const NODE_ENV = process.env.NODE_ENV || "development";  
const MONGO_URI = NODE_ENV === "production" 
    ? process.env.MONGO_URI_PROD 
    : process.env.MONGO_URI_PROD;

// **Check if MongoDB URI is Available**
if (!MONGO_URI) {
    console.error("❌ MongoDB URI is missing! Check your .env file.");
    process.exit(1); // Exit process if URI is missing
}

// **Log MongoDB URI (For Debugging)**
console.log("✅ Using MongoDB URI:", MONGO_URI);

// **Connect to MongoDB**
mongoose.connect(MONGO_URI, { dbName: 'vehiclesDB' })
.then(() => {
    console.log("✅ Connected to MongoDB successfully!");
}).catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit on connection error
});

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log(`✅ Connected to MongoDB: ${MONGO_URI}`);
}).catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
});


// **Define Schema and Model**
const VehicleSchema = new mongoose.Schema({
    name: { type: String, required: true },  
    email: { type: String, required: true }
});

const Vehicle = mongoose.model("Vehicle", VehicleSchema);

// **Set up Middleware and View Engine**
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Ensure JSON data parsing

// **Routes**
app.get("/", (req, res) => {
    res.render("index");
});

app.post("/show", async (req, res) => {
    const { name, email } = req.body;

    console.log("📥 Received Data:", req.body); // Debugging

    try {
        if (!name || !email) {
            return res.status(400).send("⚠️ Name and email are required!");
        }

        const newUser = new Vehicle({ name, email });
        await newUser.save();
        res.send("✅ Data saved successfully!");
    } catch (err) {
        console.error("❌ Error saving data:", err);
        res.status(500).send("❌ Error saving data.");
    }
});



// **Route to Insert Test Data**
app.get("/test-data", async (req, res) => {
    try {
        const testUser = new Vehicle({ name: "Test User", email: "test@example.com" });
        await testUser.save();
        res.send("Test data inserted! Now check MongoDB Atlas.");
    } catch (err) {
        console.error("❌ Error inserting test data:", err);
        res.status(500).send("Error inserting test data.");
    }
});

// **Start Server**
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
