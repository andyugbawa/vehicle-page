const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

// **1. Connect to MongoDB**
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vehiclesDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected");
}).catch(err => {
    console.error("MongoDB Connection Error:", err);
});




const  VehicleSchema = new mongoose.Schema({
    name: { type: String, required: true },  
    email: { type: String, required: true }
})

const Vehicle = mongoose.model("Vehicle",VehicleSchema)




app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.json());



app.get("/",(req,res)=>{
    res.render("index")
})



app.post("/show", async (req, res) => {
    const { name, email } = req.body;

    console.log("Received Data:", req.body); // Debugging: Check what data is received

    try {
        if (!name || !email) {
            return res.status(400).send("Name and email are required!");
        }

        const newUser = new Vehicle({ name, email });
        await newUser.save();
        res.send("Data saved successfully!");
    } catch (err) {
        console.error("Error saving data:", err);
        res.status(500).send("Error saving data.");
    }
});



app.listen(4001,()=>{
    console.log("LISTEN TO APP 4001")
})