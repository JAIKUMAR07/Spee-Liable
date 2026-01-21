import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../middleware/asyncHandler.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Users can only access their own profile unless they're admin
  if (req.user.role !== "admin" && req.user.id !== req.params.id) {
    return next(new AppError("Not authorized to access this user", 403));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;
  const userId = req.params.id;

  // Users can only update their own profile unless they're admin
  if (req.user.role !== "admin" && req.user.id !== userId) {
    return next(new AppError("Not authorized to update this user", 403));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Update fields
  if (name) user.name = name;
  if (email) user.email = email;

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    data: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
    },
  });
});

// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  const userId = req.params.id;

  if (
    !role ||
    !["admin", "manager", "driver", "viewer", "customer"].includes(role)
  ) {
    return next(new AppError("Please provide a valid role", 400));
  }

  // Prevent admin from changing their own role
  if (req.user.id === userId) {
    return next(new AppError("Cannot change your own role", 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.role = role;
  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    data: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
    },
  });
});

// @desc    Deactivate user
// @route   PATCH /api/users/:id/deactivate
// @access  Private/Admin
export const deactivateUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  // Prevent admin from deactivating themselves
  if (req.user.id === userId) {
    return next(new AppError("Cannot deactivate your own account", 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User deactivated successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  // Prevent admin from deleting themselves
  if (req.user.id === userId) {
    return next(new AppError("Cannot delete your own account", 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
