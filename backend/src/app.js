import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import deliveryMarksMapRouter from "./routes/deliveryMarks.route.js";
import deliveryStopsRouter from "./routes/deliveryStops.route.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connection established successfully!"))
  .catch((error) => console.error("MongoDB connection failed:", error.message));

// Routes
app.use("/api/delivery-stops", deliveryStopsRouter);
app.use("/api/delivery-marks", deliveryMarksMapRouter);

// Basic route to test if server is running
app.get("/", (req, res) => {
  res.send("Hello from Delivery App Backend!");
});

// Error handling middleware (MUST BE LAST)
app.use(errorHandler);

export default app;
