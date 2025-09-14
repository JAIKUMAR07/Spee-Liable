import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import deliveryStopsRouter from "./routes/deliveryStops.route.js";
dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend-backend communication
app.use(express.json()); // Parse incoming JSON requests

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connection established successfully!"))
  .catch((error) => console.error("MongoDB connection failed:", error.message));

// Routes
// We will create this file next

app.use("/api/delivery-stops", deliveryStopsRouter); // All requests to /api/delivery-stops will be handled here

// Basic route to test if server is running
app.get("/", (req, res) => {
  res.send("Hello from Delivery App Backend!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
