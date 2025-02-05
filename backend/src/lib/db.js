import mongoose from 'mongoose'

export const connectDB = async () => {
    mongoose.connect(process.env.MONGODB_URI).then(() => {
        console.log('Database Connection Successful')
    }).catch((error) => {
        console.log('Database Connection Unsuccessful')
    })
}