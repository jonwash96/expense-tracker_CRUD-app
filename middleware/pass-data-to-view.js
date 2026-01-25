const passDataToView = async (req,res,next) => {
    res.locals.user = req.session.user ? req.session.user : null;

    res.locals.tracker = req.session.tracker ? req.session.tracker : null;
    
    res.locals.message = req.session.message ? req.session.message : null;
        req.session.message && (req.session.message = null);

    res.locals.data = req.session.data ? req.session.data : null;
        req.session.data && (req.session.data = null);

    next();
}

module.exports = passDataToView;