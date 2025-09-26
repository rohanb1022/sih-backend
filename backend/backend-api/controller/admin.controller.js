import Report from "../models/report.model.js";

// Reject a post by deleting it from the database
export const rejectPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Validate postId format
    if (!postId ) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid post ID format" 
      });
    }

    // Check if the post exists
    const existingPost = await Report.findById(postId);
    
    if (!existingPost) {
      return res.status(404).json({ 
        success: false, 
        message: "Post not found" 
      });
    }

    // Delete the post from the database
    await Report.findByIdAndDelete(postId);

    res.status(200).json({
      success: true,
      message: "Post rejected and deleted successfully",
      deletedPost: {
        id: postId,
        hazardType: existingPost.hazardType,
        status: existingPost.status
      }
    });

  } catch (error) {
    console.error("Error rejecting post:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while rejecting post",
      error: error.message
    });
  }
};



export const createReport = async (req, res) => {
    try {
      const { hazardType, description, latitude, longitude } = req.body;
      let mediaUrl = null;
  
      if (req.file) {
        const uploadRes = await cloudinary.uploader.upload(req.file.path, {
          folder: "ocean-hazards",
          resource_type: "auto",
        });
        mediaUrl = uploadRes.secure_url;
        fs.unlinkSync(req.file.path);
      }
  
      const report = await Report.create({
        userId: req.user.id,
        hazardType,
        description,
        mediaUrl : "https://www.aljazeera.com/wp-content/uploads/2024/09/AP24254586188844-1726071602.jpg?resize=1800%2C1800",
        latitude,
        longitude,
      });
  
      res.status(201).json({ success: true, data: report });
    } catch (error) {
      console.error("❌ Error creating report:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };