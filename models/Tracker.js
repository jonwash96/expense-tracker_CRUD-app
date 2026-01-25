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
        default:[]
    }],
    owner:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'UserProfile',
        required:true,
        default:[]
    },
    totals:{
        expenses:[{type:Number, required:true, default:[0]}],
        credits:[{type:Number, required:true, default:[0]}],
    }
})

//* MID
// Create
trackerSchema.pre('validate', function() {
    if (!this.isNew) return;
    
    // const expenseId = new mongoose.Types.ObjectId();


    // console.log("\nPRE SAVE middleware for Tracker", this);

    // const _expenses = {};
    // for (let key in this) {
    //     if (/expense/.test(key)) {
    //         console.log("PARSE NEW EXPENSE", key)
    //         const pos = key.split('$')[0];
    //         const k = key.split('$')[1];
    //         const v = this[key];
    //         _expenses[pos] = {[k]:v};
    //     }
    // };
    // for (let exp of Object.values(_expenses)) {
    //     new Expense({ ...exp, _id:expenseId, for:this._id, owner:this.owner })
    // };

    // this.created_at = Date.now();
    return;
});

// Update
trackerSchema.pre('save', function() {
    if (this.isNew) return;

    for (let key in this._updatedValues) {
        this[key] = this._updatedValues[key]
    }
    this.updated_at = Date.now();
    return;
})


//TODO auto-add owner & member

//* MODEL
const Tracker = mongoose.model('Tracker', trackerSchema);

//* IO
module.exports = Tracker;