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
            .populate({path: 'trackers', populate:{path: 'members'}})
            .populate({path: 'profile', populate:{path: 'friends'}})
            .populate({path: 'activities', populate:{path: 'users'}})
            .populate("expenses receipts assignments")

        req.session.save(()=>res.render('documents/index.ejs', { trackers:populatedUser.trackers} ));
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
router.delete('/:documentId', async (req,res) => {
    try {
        const doc = Tracker.findById(req.params.documentId);
        let users = doc.members;
        
        let newActivity = new Activity({
            category:'delete',
            priority:3,
            title:`${req.session.user.profile.displayname} Deleted ${doc.name}`,
            users,
        });
        newActivity = newActivity.save();
        if (users && users.length > 0) {
            for (let uid of users) {
                const user = await UserProfile.findById(uid).populate('userID');
                user?.notifications?.push({ bodyID: newActivity._id, created_at:Date.now() });
            };
        };
        const owner = await User.findById(req.session.user)
        owner.activities.push(newActivity._id);
        await owner.save();
        
        await Tracker.findByIdAndDelete(doc._id);

        req.session.message = `${doc.name} Successfully Deleted`;
        req.session.save(()=>res.status(204).redirect('/documents'));
    } catch (err) {
        handleRouteError(req,res,err, 500)
    };
})

// Update - PUT (submission) => "Update Document" Update basic information of a major document type
router.put('/Tracker/:documentId', async (req,res) => {
    console.log("UPDATE", req.body);
    try {
        const owner = await User.findById(req.session.user._id)
            .populate({path: 'profile', populate:{path: 'friends'}})
            .populate({path: 'activities', populate:{path: 'users'}})
            .populate("trackers expenses receipts assignments");

        if (req.body.NUmembers) {if (!Array.isArray(req.body.NUmembers)) {
            req.body.NUmembers = req.body.NUmembers.split();
        }
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

                owner.profile.friends.push(NUuserID);
                if (!req.body.members) req.body.members = [];
                req.body.members.push(NUuserprofileID);

            };
        }
        let updatedDoc = await Tracker.findByIdAndUpdate(req.params.documentId, {...req.body, updated_at:Date.now()});

        let users = updatedDoc.members;
            
        let newActivity = new Activity({
            category:'update',
            priority:3,
            title:`${req.session.user.profile.displayname} modified ${updatedDoc.name}`,
            users,
        });
        newActivity = await newActivity.save();

        if (users.lenght > 0) {
            for (let uid of users) {
                await new Promise(async (resolve,reject) => {
                    const user = await UserProfile.findById(uid).populate('userID');
                    console.log("@PROMISE", user)
                    user?.notifications?.push({ bodyID: newActivity._id, created_at:Date.now() });
                    resolve(await user.save());
                })
            };
        }
        owner.activities.push(newActivity._id);
        await owner.save();

        req.session.save(()=>res.status(200).redirect(`/documents/Tracker/${req.params.documentId}`));
    } catch (err) {
        handleRouteError(req,res,err, 500)
    };
})

// Create - POST (submission) => "Create Document" Create a new Document
router.post('/Tracker', async (req,res) => {
    try {
        const owner = await User.findById(req.session.user._id)
            .populate({path: 'profile', populate:{path: 'friends'}})
            .populate({path: 'activities', populate:{path: 'users'}})
            .populate("trackers expenses receipts assignments");

        if (req.body.NUmembers) {if (!Array.isArray(req.body.NUmembers)) {
            req.body.NUmembers = req.body.NUmembers.split();
        };
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
                await newNonUserProfile.save();
                await newNonUser.save();

                owner.profile.friends.push(NUuserprofileID);
                if (!req.body.members) req.body['members'] = [];
                req.body.members.push(NUuserprofileID);
            }
        };

        let newDoc = new Tracker({
            ...req.body,
            owner:req.session.user.profile._id,
        });
        newDoc = await newDoc.save();

        console.log(owner)
        owner.trackers.push(newDoc._id);
        await owner.save();
        req.session.save();

        console.log('PUSHED NEW TRACKER TO USER', owner.trackers)

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
            description:`${req.session.user.profile.displayname} created a new Tracker called ${newDoc.name} with ${members?.names?.join(', ')}`,
            users: members ? members.ids : []
        });
        newActivity = await newActivity.save();
        if (getMembers && getMembers.length > 0) {
            for (let member of getMembers) {
                const user = await User.findById(member.userID);
                user.notifications.push({ bodyID: newActivity._id, created_at:Date.now() });
            };
        }
        req.session.user.activities.push(newActivity._id);
        req.session.save(()=>res.redirect(`/documents/Tracker/${newDoc._id}`));
    } catch (err) {
        handleRouteError(req,res,err, 500);
    }
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
    try { let doc;
        doc = await Tracker.findById(req.params.documentId)
            .populate('members')
            .populate('owner')
            .populate('expenses.items.assignees.credits');
        hydrateTotals(doc);

        doc.expenses.forEach(expense => {
            hydrateTotals(expense);
            expense.items.forEach(item => {
                item['credits_total'] = item.assignees.map(assignment => 
                    assignment.credits.reduce((a,b) => a.amount += b.amount, 0) )
        }) });

        doc['recents'] = doc.expenses.map(expense => 
            expense.items.sort((a,b) => b.updated_at - a.updated_at)
        ).flat();

        doc['isHydrated'] = true;
        res.render('documents/Tracker/show.ejs', { tracker:doc })
    } catch (err) {
        handleRouteError(req,res,err, 500);
    }
})

//* IO
module.exports = router;

//* FUNC