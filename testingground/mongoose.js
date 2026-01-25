const dotenv = require('dotenv').config();
const mongoose = require("mongoose");
const { User } = require('../models/User.js');
const {WebLink} = require('../models/WebLink.js');
const bcrypt = require("bcrypt");

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to", mongoose.connection.name);
});
mongoose.connection.on("error", () => {
    console.log("Error connecting to MongoDB at db", mongoose.connection.name);
});

async function run() {
    const user = await User.find({ _id: '6975c5374a81a4adac60cfef' })
    console.log(user)
    process.exit()
}

async function createNUPP() {
    let newNUProfilePhoto = new WebLink({
        title: "Non-User Profile Photo",
        url: '/images/nonUserProfilePhoto.jpg'
    });
    newNUProfilePhoto = await newNUProfilePhoto.save();
    console.log(newNUProfilePhoto);
};

const NUPP = {
  title: 'Non-User Profile Photo',
  url: '/images/nonUserProfilePhoto.jpg',
  _id: new ObjectId('6975f97cfad10aa219182dc5'),
  __v: 0
}