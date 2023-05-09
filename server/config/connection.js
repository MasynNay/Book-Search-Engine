const mongoose = require("mongoose");

mongoose.connect(
  process.env.MONGODB_URI || "https://masyn-book-search-engine.herokuapp.com/googlebooks"
);

module.exports = mongoose.connection;
