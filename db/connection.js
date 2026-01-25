const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to", mongoose.connection.name);
});

mongoose.connection.on("error", () => {
  console.log("Error connecting to MongoDB at db", mongoose.connection.name);
});
