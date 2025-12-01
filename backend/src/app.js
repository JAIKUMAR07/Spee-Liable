import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import deliveryMarksMapRouter from "./routes/deliveryMarks.route.js";
import deliveryStopsRouter from "./routes/deliveryStops.route.js";
import errorHandler from "./middleware/errorHandler.js";
import optimizationRouter from "./routes/optimization.route.js"; // ADD THIS
import notificationRouter from "./routes/notifications.route.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/users.route.js"; // NEW
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/optimization", optimizationRouter);

// MongoDB Connection
// Show which URI type we're about to use (don't print credentials)
if (process.env.MONGO_URI) {
  const isAtlas = process.env.MONGO_URI.startsWith("mongodb+srv:");
  console.log(`Using MONGO_URI (Atlas?): ${isAtlas}`);
} else {
  console.log("MONGO_URI is not set in environment variables");
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((conn) =>
    console.log(`MongoDB connected to host: ${conn.connection.host}`)
  )
  .catch((error) => console.error("MongoDB connection failed:", error.message));

// Routes
// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter); // NEW
app.use("/api/delivery-stops", deliveryStopsRouter);
app.use("/api/delivery-marks", deliveryMarksMapRouter);
app.use("/api/optimization", optimizationRouter); // ADD THIS LINE
// Basic route to test if server is running
app.use("/api/notifications", notificationRouter); // ADD THIS
app.get("/", (req, res) => {
  res.send("Hello from Delivery App Backend!");
});

// Error handling middleware (MUST BE LAST)
app.use(errorHandler);

export default app;
