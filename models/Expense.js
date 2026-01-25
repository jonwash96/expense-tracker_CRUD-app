//* MNT
const mongoose = require('mongoose');
const { WebLink, webLinkSchema} = require('./WebLink.js');
const { Item, itemSchema } = require('./Item.js');

//* DATA
const ownerSchema = new mongoose.Schema({ //! Remove
    username:String,
    displayname:String,
    ownerID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
}, {_id:false});

const expenseSchema = new mongoose.Schema({
    name:{type:String, required:true, default:"untitled_expense"},
    description:{type:String, required:false},
    status:{type:String, required:true, default:'onging'},
    created_at:{type:Number, required:true, default:Date.now()},
    updated_at:{type:Number, required:true, default:Date.now()},
    for:{type:mongoose.Schema.Types.ObjectId, required:true},
    items:[{type:itemSchema, required:true}],
    receipts:[{type:webLinkSchema, required:false}],
    photos:[{type:webLinkSchema, required:false}],
    webLinks:[{type:webLinkSchema, required:false}],
    totals:{
        items:[{type:Number, required:true, default:[0]}],
        credits:[{type:Number, required:true, default:[0]}],
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'userProfile',
        required:true
    },
});

//* MID
expenseSchema.pre('save', function() {
    const date = Date.now()
    if (this.isNew) this.created_at = date;
    this.updated_at = date;
    return;
});

// Create
expenseSchema.pre('save', async function() {
    if (!this.isNew) return;

    typeof this.for===null && delete this.for;

    const itemId = new mongoose.Types.ObjectId();

    const _items = {};
    for (let key in this) {
        if (/item/.test(key)) {
            const pos = key.split('_')[0];
            const k = key.split('_')[1];
            const v = this[key];
            _items[pos] = {[k]:v};
        };
        if (/webLink/.test(key)) { //! Do I have to construct a new web link, or just push the raw object to the typed array?
            this.webLinks.push( new WebLink({
                title:this[key][0],
                description:this[key][1],
                url:this[key][2],
            }) )
        };
        if (/receipt/.test(key)) {
            this.webLinks.push( new WebLink({
                title:this[key][0],
                description:this[key][1],
                url:this[key][2],
            }) )
        };
        if (/photo/.test(key)) {
            this.webLinks.push( new WebLink({
                title:this[key][0],
                description:this[key][1],
                url:this[key][2],
            }) )
        };
    };
    for (let I in Object.values(_items)) {
        new Item({ ...I, _id:itemId, for:this._id, owner:this.owner })
    };
    
    const upstream = await Tracker.findById(this.for);
    upstream.expenses.push(this._id);
    upstream.save();

    return;
});

//* MODEL
const Expense = mongoose.model('Expense', expenseSchema);

//* IO
module.exports = { Expense, expenseSchema};