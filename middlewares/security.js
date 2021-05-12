// Import the variable environments for the login page 

const config = require('../config');


// Function checkUser to check the user on the login page

const checkUser = (req, res, next) => {

    // The user is logged out by default
    res.locals.isLogin = false;

    // If the user is logged then we change the value to true !
    if (req.session.isLogin) {

        res.locals.isLogin = true;
        next();

    } else {

        const username = config.username,
            password = config.password;

        // If the username and password match the ones exported in the config file 
        if (req.body.username === username && req.body.password === password) {
            
            // Then the user is logged in we redirect it to the home page
            req.session.isLogin = true;
            res.redirect('/');

        // Else instead we redirect it to the login page
        } else {
            res.render('login');
        }
    }
};

module.exports = {
    checkUser,
};
