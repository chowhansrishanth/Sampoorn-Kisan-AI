const mongoose = require("mongoose");

let isConnected = false;
let isOperational = false; // true only when collection-level DB operations work

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sampoorn_kisan_ai";
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 3000,
        });
        isConnected = true;

        // Probe with an actual collection operation to detect auth issues
        try {
            // Try to count documents in a collection — this will fail if auth is required
            const db = mongoose.connection.db;
            await db.collection("users").findOne({}, { maxTimeMS: 2000 });
            isOperational = true;
            console.log("MongoDB connected and operational.");
        } catch (probeErr) {
            isOperational = false;
            console.warn("⚠️  MongoDB connected but operations restricted. Using in-memory store.");
            console.warn("   Reason:", probeErr.message);
        }

    } catch (err) {
        console.warn("⚠️  MongoDB connection unavailable. Operating in Demo/In-Memory Mode 🌱");
        isConnected = false;
        isOperational = false;
    }
};

mongoose.connection.on('disconnected', () => { isConnected = false; isOperational = false; });
const getStatus = () => isConnected;
const isDbOperational = () => isOperational;

module.exports = { connectDB, getStatus, isDbOperational };
