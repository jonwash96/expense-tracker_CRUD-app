//* MNT
const express = require('express');
const router = express.Router();
const { handleRouteError, hydrateTotals } = require('../helperFunctions.js');
const { User, UserProfile } = require('../models/User.js');
const { NonUser, NonUserProfile } = require('../models/NonUser.js');
const Tracker = require('../models/Tracker.js');
const { Expense, expenseSchema } = require('../models/Expense.js');
const Activity = require('../models/Activity');
const { WebLink, webLinkSchema} = require('../models/WebLink.js');
const { Item, itemSchema } = require('../models/Item.js');
const mongoose = require('mongoose');

//* VAR
const documentTypes = {Tracker, Expense, Item};

//* APP

//* MID
router.use((req,res,next) => {
    console.log(3.1)
    next();
})

//* ROUTE
// Index - GET (all items) => "All User's Documents" :: Populate all user content, let js/dom/user-interaction handle which/how to show
router.get('/', async (req,res) => {
    try {
        const populatedUser = await User.findById(req.session.user)
            .populate({path: 'profile', populate:{path: 'friends'}})
            .populate({path: 'activities', populate:{path: 'users'}})
            .populate("trackers expenses receipts assignments");

        req.session.user = populatedUser;
        req.session.save(()=>res.render('user/index.ejs'));
    } catch (err) {
        handleRouteError(req,res,err, 500)
    };
})

// New - GET (empty form) => "New Document" :: Create a new Document [Tracker, Expense, Item]
router.get('/:documentType/new', async (req,res) => {
    if (!res.locals.user.friends) res.locals.user.friends = [];
    res.render(`documents/${req.params.documentType}/new.ejs`);
})

// Delete - DELETE (submission) => "Delete Document" :: js/dom handles request confirmation before sending the request to the server
router.delete('/:documentType/:documentId', async (req,res) => {
    let Document;
    for (let D in documentTypes) {
        D===req.params.documentType && (Document = documentTypes[D])
    };
    try {
        const doc = Document.findById(req.params.documentId);
        let users;
        switch (req.params.documentType) {
            case 'Tracker': users = doc.members; break;
            case 'Expense': users = (await Tracker.findById(doc.for)).members; break;
            case 'Item': users = doc.assignees; break;
        };
        let newActivity = new Activity({
            category:'delete',
            priority:3,
            title:`${req.session.user.profile.displayname} Deleted ${doc.name}`,
            users,
        });
        newActivity = newActivity.save();
        for (let uid of users) {
            const user = await UserProfile.findById(uid).populate('userID');
            user.notifications.push({ bodyID: newActivity._id, created_at:Date.now() });
        };
        req.session.user.activities.push(newActivity._id);
        
        await Document.findByIdAndDelete(doc);

        req.session.message = `${doc.name} Successfully Deleted`;
        req.session.save(()=>res.status(204).redirect(`/documents/${req.params.documentType}`));
    } catch (err) {
        handleRouteError(req,res,err, 500)
    };
})

// Update - PUT (submission) => "Update Document" Update basic information of a major document type
router.put('/:documentType/:documentId', async (req,res) => {
    let Document;
    for (let D in documentTypes) {
        D===req.params.documentType && (Document = documentTypes[D])
    };
    try {
        if (req.body.NUmembers) {
            for (let NUmember of req.body.NUmembers) {
                const NUuserID = new mongoose.Types.ObjectId();
                const NUuserprofileID = new mongoose.Types.ObjectId();

                const newNonUserProfile = new UserProfile({
                    _id:NUuserprofileID,
                    username:"NU-"+NUmember.replace(' ', '_'),
                    displayname:NUmember,
                    userID:NUuserID,
                    NUuserPhotoID:'6975f97cfad10aa219182dc5'
                });
                const newNonUser = new User({
                    _id:NUuserID,
                    username:"NU-"+NUmember.replace(' ', '_'),
                    password:'nonuser',
                    profile:NUuserprofileID,
                });
                const account = await newNonUser.save();
                const profile = await newNonUserProfile.save();
                console.log("\n\n\nACCOUNT", account)
                console.log("\nROFILE", profile)

                req.session.user.friends.push(NUuserID);
                if (!req.body.members) req.body.members = [];
                req.body.members.push(NUuserprofileID);

                for (let key in req.body) {const value = req.body[key];
                    if (/assignees/.test(key)) {
                        value.forEach(id => {
                            if (id===NUmember) id = NUuserprofileID;
                        })
                    }
                }
            }
        };

        let doc = await Document.findById(req.params.documentId);

        doc['_updatedValues'] = req.body;
        const updatedDoc = await doc.save();

        res.locals.data = updatedDoc; 

        let users;
        switch (req.params.documentType) {
            case 'Tracker': users = doc.members; break;
            case 'Expense': users = (await Tracker.findById(doc.for)).members; break;
            case 'Item': users = doc.assignees; break;
        };
        let newActivity = new Activity({
            category:'update',
            priority:3,
            title:`${req.session.user.profile.displayname} modified ${updatedDoc.name}`,
            users,
        });
        newActivity = newActivity.save();
        for (let uid of users) {
            const user = await UserProfile.findById(uid).populate('userID');
            user.notifications.push({ bodyID: newActivity._id, created_at:Date.now() });
        };
        req.session.user.activities.push(newActivity._id);

        req.session.save(()=>res.status(200).redirect(`/documents/${req.params.documentType}/${req.params.documentId}`));
    } catch (err) {
        handleRouteError(req,res,err, 500)
    };
})

// Create - POST (submission) => "Create Document" Create a new Document
router.post('/Tracker', async (req,res) => {
console.log(req.body)
    try {
        if (req.body.NUmembers) {
            for (let NUmember of req.body.NUmembers) {
                const NUuserID = new mongoose.Types.ObjectId();
                const NUuserprofileID = new mongoose.Types.ObjectId();

                const newNonUserProfile = new NonUserProfile({
                    _id:NUuserprofileID,
                    username:NUmember.replace(' ', '_'),
                    displayname:NUmember,
                    userID:NUuserID,
                    NUuserPhotoID:'6975f97cfad10aa219182dc5'
                });
                const newNonUser = new NonUser({
                    _id:NUuserID,
                    username:NUmember.replace(' ', '_'),
                    profile:NUuserprofileID,
                });
                await newNonUser.save();
                await newNonUserProfile.save();

                req.session.user.friends.push(NUuserID);
                if (!req.body.members) req.body.members = [];
                req.body.members.push(NUuserprofileID);

                for (let key in req.body) {const value = req.body[key];
                    if (/assignees/.test(key)) {
                        value.forEach(id => {
                            if (id===NUmember) id = NUuserprofileID;
                        })
                    }
                }
            }
        };

        const newTrackerId = new mongoose.Types.ObjectId();
        let newDoc = new Tracker({ 
            ...req.body, 
            _id:newTrackerId,
            owner:req.session.user.profile._id 
        });
        newDoc.save();

        req.session.user.trackers.push(newDoc._id);
        req.session.save();


        let members, getMembers;
        if (req.body.members) {
            getMembers = await Promise.all( req.body.members.map(async (member) => {
                return await UserProfile.findById(member) 
            }) );
            getMembers = getMembers.filter(result => result !== null);

            members = {
                names: getMembers.map(member => member.username),
                ids: getMembers.map(member => member._id)
            };
        }

        let newActivity = new Activity({
            category:'create',
            priority:3,
            title:`New Tracker Created`,
            description:`${req.session.user.profile.displayname} created a new Tracker called ${newDoc.name} with ${members.names.join(', ')}`,
            users: members ? members.ids : []
        });
        newActivity = await newActivity.save();
        if (getMembers) {
            for (let member of getMembers) {
                const user = await User.findById(member.userID);
                user.notifications.push({ bodyID: newActivity._id, created_at:Date.now() });
            };
        }
        req.session.user.activities.push(newActivity._id);

        req.session.save(()=>res.status(200).redirect(`/documents/Tracker/${newTrackerId}`));
    } catch (err) {
        handleRouteError(req,res,err, 500)
    };
})

router.post('/Expense', async (req,res) => {
    try {
        const newExpenseId = new mongoose.Types.ObjectId();
        let newDoc = new Expense({ 
            ...req.body,
            _id:newExpenseId,
            for:req.query?.tracker || null,
            owner:req.session.user.profile._id
        });
        newDoc.save();

        req.session.user.expenses.push(newDoc._id);
        req.session.user.save();

        const getMembers = await Promise.all( //! Check Me. 
            Array.from( new Set(Object.entries(req.body)
                .filter(([k,v]) => /item\dd?\_assignees/.test(k))
                .map(KVpair => KVpair[1]).flat())
            ).map(async (member) => await UserProfile.findById(member))
        );
        
        const members = {
            names: getMembers.map(member => member.username),
            ids: getMembers.map(member => member._id)
        };
        let newActivity = new Activity({
            category:'create',
            priority:3,
            title:`New Expense Created`,
            description:`${req.session.user.profile.displayname} created a new Expense called ${newDoc.name} with ${members.names.join(', ')}`,
            users: members.ids
        });
        newActivity = await newActivity.save();
        for (let member of Object.values(getMembers)) {
            const user = await User.findById(member.userID);
            user.notifications.push({ bodyID:newActivity._id, created_at:Date.now() });
        };
        req.session.user.activities.push(newActivity._id);

        req.session.save(()=>res.status(200).redirect(`/documents/Expense/${newExpenseId}`));
    } catch (err) {
        handleRouteError(req,res,err, 500)
    };
})

router.post('/Item', async (req,res) => {
    try {
        const newItemId = new mongoose.Types.ObjectId();
        let newDoc = new Item({ 
            ...req.body,
            _id:newItemId,
            for:req.query?.tracker || null,
            owner:req.session.user.profile._id
        });
        newDoc.save();

        req.session.user.items.push(newDoc._id);
        req.session.user.save();

        const getMembers = await Promise.all( //! Check Me. 
            Array.from( new Set(Object.entries(req.body)
                .filter(([k,v]) => /assignees/.test(k))
                .map(KVpair => KVpair[1]).flat())
            ).map(async (member) => await UserProfile.findById(member))
        );
        
        const members = {
            names: getMembers.map(member => member.username),
            ids: getMembers.map(member => member._id)
        };
        let newActivity = new Activity({
            category:'create',
            priority:4,
            title:`New Expense Item Created`,
            description:`${req.session.user.profile.displayname} created a new Expense Item called ${newDoc.name} with ${members.names.join(', ')}`,
            users: members.ids
        });
        newActivity = await newActivity.save();
        for (let member of Object.values(getMembers)) {
            const user = await User.findById(member.userID);
            if (user.settings?.notifications.notifyEachItem) {
                user.notifications.push({ bodyID:newActivity._id, created_at:Date.now() });
            }
        };
        req.session.user.activities.push(newActivity._id);

        req.session.save(()=>res.status(200).redirect(`/documents/Item/${newItemId}`));
    } catch (err) {
        handleRouteError(req,res,err, 500)
    };
})

// Edit - GET (populated form) => "Edit Document"
router.get('/Tracker/:documentId/edit', async (req,res) => {
    try {
        const doc = await Tracker.findById(req.params.documentId)
            .populate('members')
            .populate('owner')
            .populate('expenses.items.assignees.credits');

        console.log(doc)
        res.render('documents/Tracker/edit.ejs', { tracker:doc });
    } catch (err) {
        handleRouteError(req,res,err, 500)
    };
})

router.get('/:documentType/:documentId/edit', async (req,res) => {
    let Document;
    for (let D in documentTypes) {
        D===req.params.documentType && (Document = documentTypes[D])
    };
    try {
        const doc = await Document.findById(req.params.documentId);
        res.render(`documents/${req.params.documentType}/edit.ejs`, { doc })
    } catch (err) {
        handleRouteError(req,res,err, 500)
    };
})

router.use((req,res,next) => {
    console.log(3.2)
    next();
});

// Show - GET (one item) => "Item Title" :: View a single document
router.get('/Tracker/:documentId', async (req,res) => {
console.log(4)
    try { let doc;
        console.log(5)
        if (!req.session.tracker | !req.session.tracker?.isHydrated) {
console.log(6, req.session.tracker)
            doc = await Tracker.findById(req.params.documentId)
                .populate('members')
                .populate('owner')
                .populate('expenses.items.assignees.credits');
console.log(7, doc)
            hydrateTotals(doc);
console.log(8, doc)
            doc.expenses.forEach(expense => {
                hydrateTotals(expense);
                expense.items.forEach(item => {
                    item['credits_total'] = item.assignees.map(assignment => 
                        assignment.credits.reduce((a,b) => a.amount += b.amount, 0) )
            }) });
console.log(9)
            doc['recents'] = doc.expenses.map(expense => 
                expense.items.sort((a,b) => b.updated_at - a.updated_at)
            ).flat();

            doc['isHydrated'] = true;
console.log(10)

            req.session.tracker = doc;
            req.session.save();
        }
        res.render('documents/Tracker/show.ejs', { tracker:doc })
    } catch (err) {
        handleRouteError(req,res,err, 500);
    }
})

router.use((req,res,next) => {
    console.log(3.3)
    next();
})

router.get('/:documentType/:documentId', async (req,res) => {
    let Document;
    for (let D in documentTypes) {
        D===req.params.documentType && (Document = documentTypes[D])
    };

    try {
        const doc = await Document.findById(req.params.documentId);
        res.render(`documents/${req.params.documentType}/show.ejs`, { doc })
    } catch (err) {
        console.log(6.5)
        handleRouteError(req,res,err, 500)
    };
})

//* IO
module.exports = router;

//* FUNC