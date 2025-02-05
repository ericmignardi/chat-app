import User from "../models/user.model.js"
import { generateToken } from "../lib/utils.js"
import bcrypt from 'bcryptjs'

export const signupUser = async (req, res) => {
    const { fullName, email, password } = req.body
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'All Fields Are Required' })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password Must Have At Least 6 Characters' })
        }
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: 'Email Already In Use' })
        }
        const salt = bcrypt.salt(10)
        const hashedPassword = bcrypt.hash(password, salt)
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        })
        if (newUser) {
            generateToken(newUser._id, res)
            await newUser.save()
            res.status(201).json({
                _id: newUser._id,
                firstName: newUser.fullName,
                password: newUser.password,
                profilePic: newUser.profilePic,
            })
        } else {
            res.status(400).json({ message: 'Invalid User Data' })
        }
    } catch (error) {
        console.log('Error in signupUser: ', error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

export const loginUser = async (req, res) => {

}

export const logoutUser = async (req, res) => {
    
}