const userSchema = new mongoose.Schema({
    created_at:{type:Number, required:true},
    username:{type:String, required:true},
    profile:{
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
        }
    }],
    trackers:[{
        name:{type:String, required:true},
        description:{type:String, required:false},
        status:{type:String, required:true, default:'ongoing'},
        created_at:{type:Number, required:true, default:Date.now()},
        updated_at:{type:Number, required:true, default:Date.now()},
        expenses:[{
            name:{type:String, required:true, default:"untitled_expense"},
            description:{type:String, required:false},
            status:{type:String, required:true, default:'onging'},
            created_at:{type:Number, required:true, default:Date.now()},
            updated_at:{type:Number, required:true, default:Date.now()},
            for:{type:mongoose.Schema.Types.ObjectId, required:true},
            items:[{
                name:{type:String, required:false, default:"untitled_item"},
                description:{type:String, requred:false},
                amount:{type:Number, required:false, default:0},
                rule_adjustments:[{type:Number, required:true, default:[]}],
                for:{type:mongoose.Schema.Types.ObjectId, required:true},
                created_at:{type:Number, required:true, default:Date.now()},
                updated_at:{type:Number, required:true, default:Date.now()},
                photos:[{type:webLinkSchema, required:false}],
                assignees:[{
                    amount:{type:Number, required:true, default:0},
                    weight:{type:Number, required:true, default:1},
                    rule:{type:String, required:true, default:'equal-share'},
                    created_at:{type:Number, required:true, default:Date.now()},
                    updated_at:{type:Number, required:true, default:Date.now()},
                    credits:[{
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
                    }],
                    for:{
                        tracker:{type:mongoose.Schema.Types.ObjectId, required:true},
                        item:{type:mongoose.Schema.Types.ObjectId, required:true}
                    },
                    userID:{
                        type:mongoose.Schema.Types.ObjectId, 
                        ref:'userProfile',
                        required:true
                    }
                }],
                owner:{
                    type:mongoose.Schema.Types.ObjectId, 
                    ref:'userProfile',
                    required:true
                },
            }],
            receipts:[{type:webLinkSchema, required:false}],
            photos:[{type:webLinkSchema, required:false}],
            webLinks:[{
                title:{type:String, required:true},
                description:{type:String, required:false},
                url:{type:String, required:false},
            }],
            totals:{
                items:[{type:Number, required:true, default:[0]}],
                credits:[{type:Number, required:true, default:[0]}],
            },
            owner:{
                type:mongoose.Schema.Types.ObjectId, 
                ref:'userProfile',
                required:true
            },
        }],
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