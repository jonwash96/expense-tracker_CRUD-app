//* MNT
const express = require('express');
const router = express.Router();
const { handleRouteError } = require('../helperFunctions.js');
const mongoose = require('mongoose');
const { User, UserProfile } = require('../models/User.js');
const { WebLink, webLinkSchema } = require('../models/WebLink.js');
const Activity = require('../models/Activity');
const bcrypt = require('bcrypt');

//* VAR

//* MID

//* ROUTE
router.get('/registration', (req, res) => {
    res.render('auth/register.ejs');
});

router.get('/login', (req, res) => {
    res.render('auth/login.ejs');
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

router.post('/login', async (req, res) => {
    try {
        const userInDB = await User.findOne({ username: req.body.username })
            .populate({path: 'notifications', populate:{path:'bodyID'}, options:{limit:50}})
            .populate({path: 'profile', populate:{path: 'friends'}})
            .populate({path: 'profile', populate:{path: 'photo'}})
            .populate('activities')
            .select('+password');
        if (!userInDB) { console.log("@login | user not found")
            res.locals.message = "An incorect username was entered. Please Try Again"
            return res.render('auth/login.ejs');
        };
    
        const isValidPassword = bcrypt.compareSync(req.body.password, userInDB.password);
        if (!isValidPassword) {
            req.body.password = null;
            res.locals.message = "An incorect password was entered. Please try again";
            return res.render('auth/register.ejs', req.body);
        };
    
        req.session.user = userInDB;
        req.session.message = `Welcome, ${req.session.user.profile.displayname}!`
        console.log("@login |", req.session.user)
        req.session.save(() => res.redirect('/'));
    } catch (err) {
        handleRouteError(req,res,err, 500, ()=>res.status(500).render('user/profile.ejs'));
    }
});

router.post('/registration', async (req,res) => {
    try {
        const userInDB = await UserProfile.findOne({ username: req.body.username });
        if (userInDB) { 
            console.log("@registration | USER EXISTS::", userInDB)
            res.locals.message = `A user with username ${req.body.username} already exist. Please choose another one.`;
            return res.render('auth/register.ejs');
        };
        if (req.body.password !== req.body.confirmPassword) {
            res.locals.message = "Passwords must match! Please check your passwords and try again";
            return res.render('auth/register.ejs', req.body);
        };

        Object.values(req.body).forEach(field => {
            try {field = field.trim()}
            catch (err) {console.warn(err)};
        });

        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        req.body.password = hashedPassword;

        const userID = new mongoose.Types.ObjectId();
        const userprofileID = new mongoose.Types.ObjectId();
        const profilePhotoID = new mongoose.Types.ObjectId();

        let newProfilePhoto = new WebLink({
            _id:profilePhotoID,
            title: "Profile Photo",
            url: '/images/defaultProfilePhoto.jpg'
        });
        let newUserProfile = new UserProfile({
            _id:userprofileID,
            username: req.body.username,
            displayname: req.body.displayname,
            userID: userID,
            photo: newProfilePhoto._id,
        });
        let newUser = new User({
            _id: userID,
            profile: userprofileID,
            username: req.body.username,
            password: req.body.password,
        });

        let welcomeNotification = new Activity({
            users: [newUser._id],
            category: 'notification',
            priority: 2,
            status: 'unseen',
            title: "Finish Setting up your Profile",
            description: "Welcome to The App! Click here to add a profile photo and finish setting up your profile so your friends can find you.",
            data: JSON.stringify({goto: '/user'}),
        });
        welcomeNotification = await welcomeNotification.save();
        newUser.notifications.push({bodyID:welcomeNotification._id});

        try {
            newUser = await newUser.save();
            newUserProfile = await newUserProfile.save();
            newProfilePhoto = await newProfilePhoto.save();
        } catch (err) {
            throw new Error(err)
        }

        req.session.user = await User.findById(newUser._id)
            .populate({path: 'notifications', populate:{path:'bodyID'}, options:{limit:50}})
            .populate({path: 'profile', populate:{path: 'friends'}})
            .populate({path: 'profile', populate:{path: 'photo'}})
            .populate('activities');
        req.session.message = `Welcome to The App, ${req.session.user.profile.displayname}!\nCheck your notifications for next steps.`;

        req.session.save(() => res.redirect(`/`));
    } catch (err) {
            handleRouteError(req,res,err, 500, ()=>res.status(500).redirect('/auth/registration'));
    }
});

//* IO
module.exports = router;

//* FUNC