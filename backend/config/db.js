const mongoose = require('mongoose');

// সরাসরি আপনার ক্লাউড ডাটাবেজ লিংক দিয়ে দেওয়া হলো যাতে কখনোই undefined না হয়
const MONGO_URI = 'mongodb+srv://moufik391:moufik391@cluster0.edolatd.mongodb.net/omnimarket_auth_db?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || MONGO_URI;
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;