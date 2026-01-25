//* MNT
const express = require('express');
const router = express.Router();
const { handleRouteError } = require('../helperFunctions.js');
const { User, UserProfile } = require('../models/User.js');
const Tracker = require('../models/Tracker.js');
const { Expense, expenseSchema} = require('../models/Expense.js');
const Activity = require('../models/Activity');
const { WebLink, webLinkSchema} = require('../models/WebLink.js');
const { Item, Assignee, Credit } = require('../models/Item.js');
const fs = require('fs').promises;
const path = require('path');

//* VAR
const documentTypes = {Tracker, Expense, Item};

//* APP

//* MID

//* ROUTE
router.post('/photo-upload', async (req,res) => {
    try {
        const id = new mongoose.Types.ObjectId();
        req.body.name = req.body.name.replace(' ', '_');
        const location = path.join(__dirname, 'public', 'uploaded-photos', `${req.body.name}-${id}`);
        fs.writeFile(location, req.body.photo, 'utf8')
            .then(() => {if (fs.access(location)===fs.constants.F_OK) {
                    res.locals.message = "File Successfully Uploaded";
                    res.status(200)
                } else {
                    res.locals.message = "File Uploaded Failed";
                    res.locals.data = { location };
                    res.status(500)
                }
        })
    } catch (err) {
        handleRouteError(500, ()=>res.status(500), "File Uploaded Failed");
    }
});

router.post('/credit/:trackerId/:expenseId/:assigneeId', async (res,req) => {
    try {
        const newCreditId = new mongoose.Types.ObjectId();
        let credit = new Credit({ 
            ...req.body, 
            _id:newCreditId,
            created_at:Date.now(),
            for:req.params.assignmentId
        });

        const assignment = await Assignee.findById(req.params.assigneeId)
            .populate({path:'userID', populate:{path:'userID'}});
        assignment.credits.push(credit);
        assignment.userID.userID.credits.push(credit._id);
        await assignment.save();

        const expense = await Expense.findById(req.params.expenseId);
        expense.totals.credits.push(credit.amount);
        await expense.save();
        
        const tracker = await Tracker.findById(req.params.tracker);
        expense.totals.credits.push(credit.amount);
        await tracker.save();

        res.status(200);
    } catch (err) {
        handleRouteError(500)
    };
})

//* IO
module.exports = router;

//* FUNC