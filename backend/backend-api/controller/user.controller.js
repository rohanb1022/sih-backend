import User from "../models/user.model.js";

// @desc Get user profile by ID
// @route GET /api/auth/profile/:id
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id; // get userId from route
    const user = await User.findById(userId).select("-password"); // exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Update user profile by ID
// @route PUT /api/auth/profile/:id
export const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body; // name, email, etc.

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
