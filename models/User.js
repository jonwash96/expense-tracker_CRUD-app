//* MNT
const mongoose = require('mongoose');

//* DATA
const userProfileSchema = new mongoose.Schema({
    username:{type:String, required:true, unique:true},
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
})

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
    notifications:[{
        status:{type:String, required:true, default:'unseen'},
        created_at:{type:Number, required:true, default:Date.now()},
        bodyID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Activity',
            required:false,
        }
    }],
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
    console.log(this)
    if (!this.displayname) this.displayname = this.username;
    if (this.isNew) this.created_at = Date.now();
})

//* MODEL
const User = mongoose.model('User', userSchema);
const UserProfile = mongoose.model('UserProfile', userProfileSchema);

//* IO
module.exports = { User, UserProfile };