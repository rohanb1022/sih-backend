import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const header = req.headers["authorization"] || "";
    console.log("Authorization Header:", header);

    if (!header) {
      return res.status(401).json({ message: "Missing Authorization header" });
    }

    const [scheme, credentials] = header.split(" ");

    if (!scheme || !credentials) {
      return res.status(401).json({ message: "Invalid Authorization header format" });
    }

    if (scheme.toLowerCase() !== "bearer") {
      return res.status(401).json({ message: "Invalid auth scheme. Use Bearer <token>" });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("JWT secret is not configured (process.env.JWT_SECRET)");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const decoded = jwt.verify(credentials, JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Unauthorized User" });
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized User", error: err.message });
  }
};

// Role-based access middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient role" });
    }
    next();
  };
};
