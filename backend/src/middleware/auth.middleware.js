import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'

export const protectRoute = async (req, res, next) => {

    try {

        // Retrieve Token From Request Cookies
        const token = req.cookies.token
    
        // Validate Token Presence
        if (!token) {
          return res.status(401).json({ message: "Unauthorized - No Token Provided" })
        }
    
        // Verify For Decoded Version
        const decoded = jwt.verify(token, process.env.SECRET)
    
        // Validate Token Validity
        if (!decoded) {
          return res.status(401).json({ message: "Unauthorized - Invalid Token" })
        }
    
        // Find User In Database Using Decoded ID
        const user = await User.findById(decoded.userId).select("-password")
    
        // Validate User Presence
        if (!user) {
          return res.status(404).json({ message: "User not found" })
        }
    
        // Add User To Request After Authentication
        req.user = user
    
        // Call Next Function (updateProfile)
        next();
        
      } catch (error) {
        console.log("Error in protectRoute middleware: ", error.message)
        res.status(500).json({ message: "Internal server error" })
      }
}