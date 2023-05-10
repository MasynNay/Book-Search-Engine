const mongoose = require("mongoose");

mongoose.connect(
  process.env.MONGODB_URI || "mongodb+srv://masynnay:FallynEzra20@cluster0.2al5jrr.mongodb.net/?retryWrites=true&w=majority"
);

module.exports = mongoose.connection;
