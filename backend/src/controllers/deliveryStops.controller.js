import DeliveryStop from "../models/deliveryStops.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { io } from "../../server.js"; // Import Socket.io instance

// @desc    Get user's delivery stops
// @route   GET /api/delivery-stops
// @access  Private
export const getDeliveryStops = asyncHandler(async (req, res, next) => {
  let query = {};

  // Drivers see stops assigned to them
  if (req.user.role === "driver") {
    query.assignedTo = req.user.id;
  }
  // Customers see their own packages
  else if (req.user.role === "customer") {
    query.customer = req.user.id;
  }
  // Admin sees all stops
  else if (req.user.role === "admin") {
    // No filter for admin
  }

  const stops = await DeliveryStop.find(query)
    .populate("customer", "name email")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: stops.length,
    data: stops,
  });
});

// @desc    Get all delivery stops (Admin/Manager only - for overview)
// @route   GET /api/delivery-stops/all
// @access  Private (Admin/Manager)
export const getAllDeliveryStops = asyncHandler(async (req, res, next) => {
  // ✅ Only admin and manager can see all stops
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return next(new AppError("Not authorized to view all delivery stops", 403));
  }

  const stops = await DeliveryStop.find()
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email role")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: stops.length,
    data: stops,
  });
});

// @desc    Create a new delivery stop (package scan)
// @route   POST /api/delivery-stops
// @access  Private (Drivers only)
export const createDeliveryStop = asyncHandler(async (req, res, next) => {
  const { name, location, address, mobile_number, customerEmail } = req.body;

  // Only drivers can create delivery stops
  if (req.user.role !== "driver") {
    return next(new AppError("Only drivers can scan packages", 403));
  }

  // Validation
  if (!name || !location || !address) {
    return next(
      new AppError("Please provide name, location, and address", 400)
    );
  }

  // Find customer by email
  let customer;
  if (customerEmail) {
    customer = await User.findOne({ email: customerEmail, role: "customer" });
    if (!customer) {
      return next(new AppError("Customer not found with this email", 404));
    }
  } else {
    return next(new AppError("Customer email is required", 400));
  }

  const newStop = new DeliveryStop({
    name,
    location,
    address,
    mobile_number: mobile_number || "N/A",
    available: "unknown", // Default to unknown until customer updates
    customer: customer._id,
    assignedTo: req.user.id,
    scannedBy: req.user.id,
  });
  const savedStop = await newStop.save();
  await savedStop.populate("customer", "name email");

  // ✅ Create notification for customer
  await Notification.create({
    user: customer._id,
    title: "Package Scanned",
    message: `Your package "${name}" has been scanned and is ready for delivery. Please update availability status.`,
    type: "package_scanned",
    deliveryStop: savedStop._id,
    actionRequired: true,
  });

  res.status(201).json({
    success: true,
    data: savedStop,
    message: "Package scanned successfully and customer notified",
  });
});

// @desc    Update a delivery stop's availability
// @route   PATCH /api/delivery-stops/:id
// @access  Private
export const updateDeliveryStopAvailability = asyncHandler(
  async (req, res, next) => {
    const { available } = req.body;
    const { id } = req.params;

    if (!available) {
      return next(new AppError("Please provide availability status", 400));
    }

    const validStatuses = ["available", "unavailable", "unknown"];
    if (!validStatuses.includes(available)) {
      return next(
        new AppError(
          "Availability must be one of: available, unavailable, unknown",
          400
        )
      );
    }

    const stop = await DeliveryStop.findById(id);
    if (!stop) {
      return next(new AppError("Delivery stop not found", 404));
    }

    // ✅ Check if user owns this stop or is admin/manager
    if (
      stop.assignedTo.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "manager"
    ) {
      return next(
        new AppError("Not authorized to update this delivery stop", 403)
      );
    }

    stop.available = available;
    const updatedStop = await stop.save();

    res.status(200).json({
      success: true,
      data: updatedStop,
    });
  }
);

// @desc    Delete a delivery stop
// @route   DELETE /api/delivery-stops/:id
// @access  Private
export const deleteDeliveryStop = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const stop = await DeliveryStop.findById(id);
  if (!stop) {
    return next(new AppError("Delivery stop not found", 404));
  }

  // ✅ UPDATED: Allow drivers to delete their own stops
  const canDelete =
    // Admin/manager can delete anything
    req.user.role === "admin" ||
    req.user.role === "manager" ||
    // Driver can delete stops assigned to them
    stop.assignedTo.toString() === req.user.id;

  if (!canDelete) {
    return next(
      new AppError("Not authorized to delete this delivery stop", 403)
    );
  }

  await stop.deleteOne();

  res.status(200).json({
    success: true,
    message: "Delivery stop deleted successfully",
  });
});

// @desc    Get delivery stops statistics for current user
// @route   GET /api/delivery-stops/stats
// @access  Private
export const getDeliveryStats = asyncHandler(async (req, res, next) => {
  const stats = await DeliveryStop.aggregate([
    {
      $match: { assignedTo: req.user._id }, // ✅ User-specific stats
    },
    {
      $group: {
        _id: "$available",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// @desc    Update package availability (Customer action)
// @route   PATCH /api/delivery-stops/:id/availability
// @access  Private
// ✅ ADD THIS FUNCTION: Update package availability (Customer action)
export const updatePackageAvailability = asyncHandler(
  async (req, res, next) => {
    const { available } = req.body;
    const { id } = req.params;

    if (!available) {
      return next(new AppError("Please provide availability status", 400));
    }

    const validStatuses = ["available", "unavailable", "unknown"];
    if (!validStatuses.includes(available)) {
      return next(
        new AppError(
          "Availability must be one of: available, unavailable, unknown",
          400
        )
      );
    }

    const stop = await DeliveryStop.findById(id)
      .populate("customer", "name email")
      .populate("assignedTo", "name email");
    if (!stop) {
      return next(new AppError("Package not found", 404));
    }

    // ✅ Check if user is the customer who owns this package
    if (
      stop.customer._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(new AppError("Not authorized to update this package", 403));
    }
    const oldStatus = stop.available;
    stop.available = available;
    const updatedStop = await stop.save();

    // ✅ Create notification for driver if status changed by customer
    if (stop.assignedTo && stop.assignedTo.toString() !== req.user.id) {
      await Notification.create({
        user: stop.assignedTo,
        title: "Package Status Updated",
        message: `Customer ${stop.customer.name} updated package "${stop.name}" to ${available}`,
        type: "status_change",
        deliveryStop: stop._id,
      });
    }

    // ✅ REAL-TIME UPDATE: Emit Socket.io event to all drivers
    io.emit("package-status-changed", {
      packageId: stop._id,
      status: available,
      name: stop.name,
      address: stop.address,
      location: stop.location,
      assignedTo: stop.assignedTo?._id,
      customer: stop.customer._id,
      timestamp: new Date(),
    });
    res.status(200).json({
      success: true,
      data: updatedStop,
      message: `Package marked as ${available}`,
    });
  }
);
// @desc    Get customer's packages
// @route   GET /api/delivery-stops/customer/my-packages
// @access  Private (Customer only)
export const getCustomerPackages = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "customer") {
    return next(new AppError("Only customers can access this route", 403));
  }

  const packages = await DeliveryStop.find({ customer: req.user.id })
    .populate("assignedTo", "name email")
    .populate("scannedBy", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: packages.length,
    data: packages,
  });
});
