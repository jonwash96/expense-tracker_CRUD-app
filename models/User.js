//* MNT
const mongoose = require('mongoose');

//* DATA
const userProfileSchema = new mongoose.Schema({
    username:{type:String, required:true},
    displayname:{type:String, required:true},
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    photo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'WebLink',
        required:false
    },
    friends:[{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'UserProfile',
        required:false
    }]
});

const notificationSchema = new mongoose.Schema({
    status:{type:String, required:true, default:'unseen'},
    created_at:{type:Number, required:true, default:Date.now()},
    bodyID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Activity',
        required:false,
    }
});

const userSchema = new mongoose.Schema({
    created_at:{type:Number, required:true},
    username:{type:String, required:true},
    profile:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'UserProfile',
        required:true,
    },
    password:{
        type:String,
        required:true,
        selected:false
    },
    activities:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Activity',
        required:false,
        default:[]
    }],
    notifications:[{type:notificationSchema, required:false, default:[]}],
    trackers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Tracker',
        required:false,
        default:[]
    }],
    expenses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Expense',
        required:false,
        default:[]
    }],
    receipts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'WebLink',
        required:false,
        default:[]
    }],
    assignments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Assignee',
        required:false,
        default:[]
    }],
    credits:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Credit',
        required:false,
        default:[]
    }]
});

//* MID
userSchema.pre('validate', function() {
    if (!this.displayname) this.displayname = this.username;
    if (this.isNew) this.created_at = Date.now();
})

//* MODEL
const User = mongoose.model('User', userSchema);
const UserProfile = mongoose.model('UserProfile', userProfileSchema);
const Notification = mongoose.model('Notification', notificationSchema);

//* IO
module.exports = { User, UserProfile, Notification, notificationSchema };