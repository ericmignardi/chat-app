import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  // Retrieve ID Of Currently Logged In User
  const loggedInUserId = req.user._id;

  try {
    // Find All OTHER Users In Database
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    // Respond With Filtered Users
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  // Retrieve Receiever ID From Request Params
  const { id: userToChatId } = req.params;

  // Retrieve My ID (Sender) From Request User
  const myId = req.user._id;

  try {
    // Find Messages In Database
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    // Respond With Messages
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  // Retrieve Text & Image From Request Body
  const { text, image } = req.body;

  // Retrieve Receiver ID From Request Params
  const { id: receiverId } = req.params;

  // Retrieve My ID (Sender) From Request User
  const senderId = req.user._id;

  try {
    // Upload Image To Cloudinary If Present & Store URL
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Create New Message With Image URL
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    // Save New Message To Database
    await newMessage.save();

    // Emit Message To Single Receiver Only
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Respond With New Message
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
