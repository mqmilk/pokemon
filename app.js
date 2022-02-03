const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');

const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');

const passport = require('passport');
const LocalStrategy = require('passport-local');


const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

//require routes
const pokemonRoutes = require('./routes/pokemon.js')
const userRoutes = require('./routes/user.js')

//load models
const User = require('./models/user.js');

const ExpressError = require('./utilities/ExpressError.js');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/pokemon';
mongoose.connect(dbUrl,{
    useNewUrlParser: true, 
    useUnifiedTopology: true,
})
.then(d => {
    console.log('CONNECT TO MONGODB');
})
.catch(err => {
    console.log('ERROR TO CONNECT TO MONGODB');
    console.log(err);
});

app.use(express.static(path.join(__dirname, 'public')));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));


const sec = process.env.SECRET || "THISSHOULDBEBETTERSECRET"; 
app.use(session({
    name: 'pokemon web',
    secret: sec,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true, //not working for our localhost website, but for http, should included
        expires: Date.now() + 1000 * 60 * 60 *24 * 7,
        maxAge: 1000 * 60 * 60 *24 * 7,
    },
    store: MongoStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24 * 3600 // time period in seconds
      })
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());

app.use(mongoSanitize());
app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})


//routes
app.use('/pokemons', pokemonRoutes);
app.use('/users', userRoutes);



//home page
app.get('/', (req, res) => {
    //res.send('home');
    res.render('home.ejs');
});


//all other pages, cannot find
app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});

//error
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something Went Wrong';
    res.status(statusCode).render('error.ejs', {err});
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`CONNECTION ON PORT ${port}`);
});