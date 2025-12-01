import app from "./src/app.js";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const port = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173", // ✅ Vite default port
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Join driver to drivers room
  socket.on("join-driver-room", (driverId) => {
    socket.join(`driver:${driverId}`);
    socket.join("drivers"); // Global drivers room
    console.log(`🚚 Driver ${driverId} joined room`);
  });

  // Join customer to their room
  socket.on("join-customer-room", (customerId) => {
    socket.join(`customer:${customerId}`);
    console.log(`📦 Customer ${customerId} joined room`);
  });

  // Handle package status updates from customers
  socket.on("package-status-updated", (data) => {
    console.log(
      `📦 Package status update: ${data.packageId} -> ${data.status}`
    );

    // Broadcast to all drivers that package status changed
    io.to("drivers").emit("package-status-changed", {
      packageId: data.packageId,
      status: data.status,
      name: data.customerName || "Customer",
      timestamp: new Date(),
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 Server is running on port: ${port}`);
  console.log(`🔗 Socket.io enabled for real-time updates`);
});

export { io };
