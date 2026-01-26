//* MNT
const mongoose = require('mongoose');
const { Expense, expenseSchema } = require('./Expense.js'); 

//* DATA
const trackerSchema = new mongoose.Schema({
    name:{type:String, required:true},
    description:{type:String, required:false},
    status:{type:String, required:true, default:'ongoing'},
    created_at:{type:Number, required:true, default:Date.now()},
    updated_at:{type:Number, required:true, default:Date.now()},
    expenses:[{type:expenseSchema, required:true, default:[]}],
    members:[{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'UserProfile',
        required:true,
    }],
    owner:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'UserProfile',
        required:true,
    },
    totals:{
        expenses:[{type:Number, required:true, default:[0]}],
        credits:[{type:Number, required:true, default:[0]}],
    }
})

//* MID
// Create
trackerSchema.pre('validate', function() {
    if (this.isNew) this.created_at = Date.now();
    this.updated_at = Date.now();
    console.log("@User MID. this:", this)
})


//TODO auto-add owner & member

//* MODEL
const Tracker = mongoose.model('Tracker', trackerSchema);

//* IO
module.exports = Tracker;