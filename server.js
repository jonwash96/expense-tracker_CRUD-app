//* MNT
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const methodOverride = require('method-override');
const authController = require('./controllers/auth.js');
const userController = require('./controllers/user.js');
const documentsController = require('./controllers/documents.js');
const actionsController = require('./controllers/actions.js');
const searchController = require('./controllers/search.js');
const { User } = require('./models/User.js');
const { handleRouteError } = require('./helperFunctions.js');
const MongoStore = require('connect-mongo');
const passDataToView = require('./middleware/pass-data-to-view.js');


//* VAR
const PORT = process.env.PORT || 3000;

//* APP
const app = express();

//* MID
require('./db/connection.js');
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({mongoUrl: process.env.MONGODB_URI}),
    cookie: {maxAge: 1000 * 60 * 60 * 24}
}));

app.use(async (req,res,next) => {
    if (req.session.user) {
        try { if (!req.session.user.profile.photo.url) {
                req.session.user = await User.findById(req.session.user)
                        .populate('profile.friends profile.photo notifications.bodyID');
                    res.locals.user = req.session.user;
                    req.session.save(()=>next());
            } else next();
        } catch (err) {
            if (err.message.includes("Cannot read properties of undefined (reading 'url')")) {
                try {
                    req.session.user = await User.findById(req.session.user)
                        .populate('profile.friends profile.photo notifications.bodyID');
                    res.locals.user = req.session.user;
                    req.session.save(()=>next());
                } catch (err) {
                    handleRouteError(req,res,err, 500, next);
                }
            } else handleRouteError(req,res,err, 500, next);
        }
    } else next();
})

app.use(passDataToView);

app.use((req,res,next) => {
    console.log("-->>>SESSION USER:", 
        "| username:", req.session.user.username,
        "| displayname:", req.session.user.profile.displayname,
        "| photo", req.session.user.profile.photo.url
    )
    next();
})
//* ROUTE
app.post('/test-form', (req,res) => {
    res.json(req.body);
})

app.use('/auth', authController);

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/dashboard', (req,res) => {
    res.redirect(`/user/${req.session.user._id}/dashboard`);
})

app.use('/user', userController);
app.use('/documents', documentsController);
app.use('/actions', actionsController);
app.use('/search', searchController);

app.get('/*splat', (req, res) => {
    res.render('404.ejs', { url: req.url })
});

//* IO
app.listen(PORT, () => console.log(`Server Running on port ${PORT}. Access at [http://localhost:${PORT}]`));