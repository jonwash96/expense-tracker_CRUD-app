//* MNT
const express = require('express');
const router = express.Router();
const { handleRouteError } = require('../helperFunctions.js');
const { User, UserProfile } = require('../models/User.js');
const Tracker = require('../models/Tracker.js');
const { Expense, expenseSchema } = require('../models/Expense.js');
const Activity = require('../models/Activity');
const { WebLink, webLinkSchema} = require('../models/WebLink.js');
const { Item, itemSchema } = require('../models/Item.js');

//* VAR
const documentTypes = {Tracker, Expense, Item};

//* APP

//* MID

//* ROUTE
// Index - GET (all items) => "User Profile" :: Populate all user content, let js/dom/user-interaction handle which/how to show
router.get('/', async (req,res) => {
    try {
        const populatedUser = await User.findById(req.session.user._id)
            .populate({path: 'notifications.bodyID', options:{limit:50}})
            .populate({path: 'profile', populate:{path: 'friends'}})
            .populate({path: 'profile', populate:{path: 'photo'}})
            .populate({path: 'activities', populate:{path: 'users'}})
            .populate({path: 'trackers', populate:{path: 'members'}})
            .populate("expenses receipts assignments");

        console.log("POPULATED USER", populatedUser);

        const data = {};
        for (const tracker of populatedUser.trackers) {
            data['expenses_calculated'] = tracker.totals.expenses
                .reduce((a,b) => a += b, 0);
            data['credits_calculated'] = tracker.totals.credits
                .reduce((a,b) => a += b, 0);
        };

        data.totals = {
            assignments:populatedUser.assignments.map(a => a.amount)
                .reduce((a,b) => a += b, 0),
            credits:populatedUser.credits.map(c => c.amount)
                .reduce((a,b) => a += b, 0),
        };

        data.totals['margin'] = data.totals.assignments - data.totals.credits;
        console.log("DATA", data)
        console.log("USER", populatedUser)

        if (data.expenses_calculated!==null) {}
        req.session.save(()=>res.render('user/profile.ejs', { user:populatedUser, data }));
    } catch (err) {
        handleRouteError(req,res,err, 500)
    };
});
// Index - GET (all items) => "User Dashboard" :: Populate all user content, let js/dom/user-interaction handle which/how to show
router.get('/dashboard', async (req,res) => {
    try {
        const populatedUser = await User.findById(req.session.user._id)
            .populate({path: 'notifications.bodyID', options:{limit:50}})
            .populate({path: 'profile', populate:{path: 'friends'}})
            .populate({path: 'activities', populate:{path: 'users'}})
            .populate({path: 'trackers', populate:{path: 'members'}})
            .populate("profile.photo expenses receipts assignments");

        const data = {};
        populatedUser.trackers.forEach(tracker => {
            data['expenses_calculated'] = tracker.totals.expenses
                .reduce((a,b) => a += b, 0);
            data['credits_calculated'] = tracker.totals.credits
                .reduce((a,b) => a += b, 0);
        });

        data.totals = {
            assignments:populatedUser.assignments.map(a => a.amount),
            credits:populatedUser.credits.map(c => c.amount),
        };

        data.totals['margin'] = data.totals.assignments - data.totals.credits;
        console.log("DATA", data)
        req.session.user = populatedUser;
        req.session.save(()=>res.render('user/dashboard.ejs', { data }));
    } catch (err) {
        handleRouteError(req,res,err, 500)
    };
})

router.get('/notifications', async (req,res) => {
    try {
        const user = await User.findById(req.session.user);
        res.render('user/notifications.ejs', { user, returnTo:req.query.returnTo })
    } catch (err) {
        handleRouteError(req,res,err, 500);
    }
})

// New - GET (empty form) => 
// Delete - DELETE (submission) => 

// Update - PUT (submission) =>

// Create - POST (submission) =>

// Edit - GET (populated form) =>


// Show - GET (one item) =>

//* IO
module.exports = router;

//* FUNC