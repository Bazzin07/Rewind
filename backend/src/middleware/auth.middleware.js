import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      // Clear invalid token
      res.clearCookie("jwt");
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute:", error.message);
    
    // Clear invalid token on error
    res.clearCookie("jwt");
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired" });
    }
    
    res.status(401).json({ message: "Not authenticated" });
  }
};