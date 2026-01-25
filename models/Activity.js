//* MNT
const mongoose = require('mongoose');

//* DATA
const activitySchema = new mongoose.Schema({
    category:{type:String, required:true},
    priority:{type:Number, required:false, default:5},
    status:{type:String, required:false},
    title:{type:String, required:true},
    description:{type:String, required:false},
    created_at:{type:Number, required:true},
    data:[{type:String, required:false}],
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'UserProfile',
        required:true
    }],
});

//* MID
activitySchema.pre('validate', function() {
    if (this.isNew) this.created_at = Date.now();
});

//* MODEL
const Activity = mongoose.model('Activity', activitySchema);

//* IO
module.exports = Activity;