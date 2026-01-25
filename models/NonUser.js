//* MNT
const mongoose = require('mongoose');
const { Notification, notificationSchema } = require('./User.js');

//* DATA
const nonUserProfileSchema = new mongoose.Schema({
    username:{type:String, required:true},
    displayname:{type:String, required:true},
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'NonUser',
        required:true
    },
    photo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'WebLink',
        required:false
    },
});

const nonUserSchema = new mongoose.Schema({
    created_at:{type:Number, required:true},
    username:{type:String, required:true},
    profile:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'NonUserProfile',
        required:true,
    },
    activities:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Activity',
        required:false,
        default:[]
    }],
    notifications:[{type:notificationSchema, required:false}],
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
nonUserSchema.pre('validate', function() {
    if (!this.displayname) this.displayname = this.username;
    if (this.isNew) this.created_at = Date.now();
})

//* MODEL
const NonUser = mongoose.model('NonUser', nonUserSchema);
const NonUserProfile = mongoose.model('NonUserProfile', nonUserProfileSchema);

//* IO
module.exports = { NonUser, NonUserProfile };