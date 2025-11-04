import mongoose from 'mongoose'

mongoose.set('strictQuery', true)

export const connectDB = async (uri) => {
  if (!uri) {
    throw new Error('MONGODB_URI is required')
  }

  await mongoose.connect(uri)
  console.log('MongoDB connected')
}
