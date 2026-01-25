//* MNT
const express = require('express');
const router = express.Router();
const { handleRouteError } = require('../helperFunctions.js');
const { User, UserProfile } = require('../models/User.js');
const Tracker = require('../models/Tracker.js');
const { Expense, expenseSchema} = require('../models/Expense.js');
const Activity = require('../models/Activity');
const { WebLink, webLinkSchema} = require('../models/WebLink.js');
const { Item, itemSchema } = require('../models/Item.js');

//* VAR
const documentTypes = {Tracker, Expense, Item};

//* APP

//* MID

//* ROUTE
// Index - GET (all items) => 
router.get('/', (req,res) => res.render('/search/index.ejs'));

// Search - POST (submission) =>
router.post('/', async (req,res) => {
    
})

// Show - GET (one item) =>

//* IO
module.exports = router;

//* FUNC