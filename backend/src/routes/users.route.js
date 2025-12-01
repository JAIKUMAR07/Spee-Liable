import express from "express";
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserRole,
  deactivateUser,
} from "../controllers/user.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes protected
router.use(protect);

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get("/", authorize("admin"), getUsers);

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get("/:id", getUser);

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
router.put("/:id", updateUser);

// @desc    Update user role (Admin only)
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
router.patch("/:id/role", authorize("admin"), updateUserRole);

// @desc    Deactivate user (Admin only)
// @route   PATCH /api/users/:id/deactivate
// @access  Private/Admin
router.patch("/:id/deactivate", authorize("admin"), deactivateUser);

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete("/:id", authorize("admin"), deleteUser);

export default router;
