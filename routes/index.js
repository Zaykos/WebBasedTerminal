const express = require('express');
const router = express.Router();

// Get the homepage (list of containers)
router.get('/', (req, res, next) => {
    res.redirect('/containers');
});

// When the user click on the logout button he's redirected to /login
router.get('/logout', (req, res, next) => {
    req.session.isLogin = false;
    res.locals.isLogin = false;
    res.redirect('/login');
});

module.exports = router;
