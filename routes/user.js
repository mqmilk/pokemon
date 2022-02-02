const express = require('express');
const router = express.Router();
const passport = require('passport');

//load models
const User = require('../models/user.js');

const catchAsync = require('../utilities/catchAsync.js');




router.get('/register', (req, res) => {
    res.render('users/register.ejs');        
});


router.post('/register', catchAsync(async(req, res, next) => {
    try{
    const { username, email, password } = req.body;
    const user = new User({email, username});
    const regUser = await User.register(user, password);
    req.flash('success', 'Now Register!')
    res.redirect('/users/login');
    } catch(err){
        req.flash('error', err.message);   
        res.redirect('/users/register'); 
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login.ejs');
});


router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/users/login'}), catchAsync(async(req, res, next) => {
    req.flash('success', 'Welcome Back!');
    const rediectUrl = req.session.oriUrl || '/';
    delete req.session.oriUrl;
    res.redirect(rediectUrl);
}));

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Successfullt Logged Out');
    res.redirect('/');
});


module.exports = router;