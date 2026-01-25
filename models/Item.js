//* MNT
const mongoose = require('mongoose');
const { WebLink, webLinkSchema} = require('./WebLink.js');

//* DATA
const creditSchema = new mongoose.Schema({
    amount:{type:Number, required:true, default:0},
    created_at:{type:Number, required:true, default:Date.now()},
    for:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'Item',
        required:true,
        selected:false
    },
    creditor:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'userProfile',
        required:true
    },
    assignment:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'Assignee',
        required:true
    }
});

const assignmentSchema = new mongoose.Schema({
    amount:{type:Number, required:true, default:0},
    weight:{type:Number, required:true, default:1},
    rule:{type:String, required:true, default:'equal-share'},
    created_at:{type:Number, required:true, default:Date.now()},
    updated_at:{type:Number, required:true, default:Date.now()},
    credits:[{type:creditSchema, required:false}],
    for:{
        tracker:{type:mongoose.Schema.Types.ObjectId, required:true},
        item:{type:mongoose.Schema.Types.ObjectId, required:true}
    },
    userID:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'userProfile',
        required:true
    }
});

const itemSchema = new mongoose.Schema({
    name:{type:String, required:false, default:"untitled_item"},
    description:{type:String, requred:false},
    amount:{type:Number, required:false, default:0},
    rule_adjustments:[{type:Number, required:true, default:[]}],
    for:{type:mongoose.Schema.Types.ObjectId, required:true},
    created_at:{type:Number, required:true, default:Date.now()},
    updated_at:{type:Number, required:true, default:Date.now()},
    photos:[{type:webLinkSchema, required:false}],
    assignees:[{type:assignmentSchema, required:false}],
    owner:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'userProfile',
        required:true
    },
});

//* MID
itemSchema.pre('validation', function() {
    const date = Date.now()
    if (this.isNew) this.created_at = date;
    this.updated_at = date;
});

// Update
itemSchema.pre('save', async function() {
    if (this.isNew) return;

    if (this._updatedValues.amount!==this.amount) {
        const upstream = await Expense.findById(this.for);
        upstream.items.push(this._id);
        upstream.totals.items.push(
            Number(this._updatedValues.amount) - Number(this.amount) //! Does schema type of number autocast strings to numbers?
        );
        upstream.save();

        const upstreamTracker = await Tracker.findById(upstream.for);
        upstreamTracker.totals.expenses.push(this.amount);
        upstreamTracker.save();
    }

    return;
})

// Create
// itemSchema.pre('save', async function() {
//     if (!this.isNew) return;
// console.log("COMPILE NEW EXPENSE.ITEM", this);
//     typeof this.for===null && delete this.for;

//     for (let key in this) {
//         if (/assignees/.test(key)) {
//             console.log("PARSE ASIGNEE FOR ITEM", this);
//             this[key].created_at = Date.now();
//             this.assignees.push(this[key])
//         };
//         if (/photo/.test(key)) {
//             this.webLinks.push( new WebLink({
//                 title:this[key][0],
//                 description:this[key][1],
//                 url:this[key][2],
//             }) )
//         };
//     };

//     const upstream = await Expense.findById(this.for);
//     upstream.items.push(this._id);
//     upstream.totals.items.push(this.amount);
//     upstream.save();

//     const upstreamTracker = await Tracker.findById(upstream.for);
//     upstreamTracker.totals.expenses.push(this.amount);
//     upstreamTracker.save();
//     await this.save();
// console.log("DONE COMPILING EXPENSE.ITEM", this);
//     return;
// });

// creditSchema.pre('save', function() {
//     this.created_at = Date.now();
// });

//* MODEL
const Item = mongoose.model('Item', itemSchema);
const Credit = mongoose.model('Credit', creditSchema);
const Assignee = mongoose.model('Assignee', assignmentSchema);

//* IO
module.exports = { Item, itemSchema, Assignee, assignmentSchema, Credit, creditSchema };