import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  // Pull Data From Request Body/Payload
  const { fullName, email, password } = req.body;

  try {
    // Validation (Required Fields/Lengths & Existing Users)
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All Fields Are Required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password Must Have At Least 6 Characters" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email Already In Use" });
    }

    // Password Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Creating New User W/ Hashed Password
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    // Generate Token & Save User (201 Status W/ New User Data JSON)
    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        firstName: newUser.fullName,
        password: newUser.password,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid User Data" });
    }
  } catch (error) {
    // Server Error Logging & Response
    console.log("Error in signup: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  // Pull Data From Request Body/Payload
  const { email, password } = req.body;

  try {
    // Validation (Required Fields/Lengths, Non-Existing User, Password Comparison)
    if (!email || !password) {
      return res.status(400).json({ message: "All Fields Are Required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Generate Token (200 Status W/ User Data JSON)
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    // Reset/Invalidate Cookie
    res.cookie("token", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.log("Error in logout: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // Retrieve Profile Picture & User ID From Request Body/User
    const { profilePic } = req.body;
    const userId = req.user._id;

    // Validate Profile Picture Presence
    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    // Upload To Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    // Find & Update User's Profile Picture In Database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    // Return Updated User
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    // Respond With Request User
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
