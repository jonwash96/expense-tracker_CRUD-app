//* MNT
const mongoose = require('mongoose');

//* DATA
const webLinkSchema = new mongoose.Schema({
    title:{type:String, required:true},
    description:{type:String, required:false},
    url:{type:String, required:false},
})

//* MID

//* MODEL
const WebLink = mongoose.model('WebLink', webLinkSchema)

//* IO
module.exports = { WebLink, webLinkSchema };