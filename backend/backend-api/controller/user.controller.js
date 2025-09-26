import User from "../models/user.model.js";
import Report from "../models/report.model.js";

// @desc Get user profile and reports by ID
// @route GET /api/users/profile/:id
// export const getProfile = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const user = await User.findById(userId).select("-password");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Get total reports count
//     const totalReports = await Report.countDocuments({ user: userId });

//     // Get resolved reports count
//     const resolvedReports = await Report.countDocuments({ user: userId, status: "Resolved" });

//     // Get recent reports
//     const recentReports = await Report.find({ user: userId })
//       .sort({ createdAt: -1 })
//       .limit(10); // Adjust the limit as needed

//     // Combine all data into a single response object
//     const profileData = {
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       memberSince: user.createdAt,
//       pointsEarned: user.points,
//       achievements: user.achievements,
//       totalReports,
//       resolvedReports,
//       reports: recentReports,
//     };

//     res.json(profileData);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Correcting the queries to use 'reporterId'
    // This assumes your Report model has a 'reporterId' field
    const totalReports = await Report.countDocuments({ reporterId: userId });
    const resolvedReports = await Report.countDocuments({ reporterId: userId, status: "Resolved" });
    const recentReports = await Report.find({ reporterId: userId })
      .sort({ createdAt: -1 })
      .limit(10); // Adjust the limit as needed

    // Combine all data into a single response object
    const profileData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      memberSince: user.createdAt,
      pointsEarned: user.points,
      achievements: user.achievements,
      totalReports,
      resolvedReports,
      reports: recentReports,
    };

    res.json(profileData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Update user profile by ID
// @route PUT /api/users/profile/:id
export const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

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

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        const usersWithReports = await Promise.all(
            users.map(async (user) => {
                const totalReports = await Report.countDocuments({ reporterId: user._id });
                const recentReport = await Report.findOne({ reporterId: user._id })
                    .sort({ createdAt: -1 });

                // You might need a way to determine user status (e.g., from WebSocket, or a 'last_active' field)
                // For now, we'll assume they are active if they have a recent report.
                const status = recentReport ? "Active" : "Inactive";

                return {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    reportsCount: totalReports,
                    status,
                };
            })
        );

        res.json({ success: true, data: usersWithReports });
    } catch (error) {
        console.error("❌ Error fetching all users:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};