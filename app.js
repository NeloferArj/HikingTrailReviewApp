const express = require('express')
const port = 3000;
const app = express();
const methodOverride = require('method-override')
const Restaurant = require('./models/Restaurant')
const Review = require('./models/Review')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const {reviewSchema, restaurantSchema} = require('./schema')
const User = require('./models/User');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session')
var flash = require('connect-flash');
require("dotenv").config({path: "./config.env"})

/////////////////////////////////// mongodb //////////////////////////////////////////////

mongoose.connect('mongodb://localhost:27017/yelp', {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


////////////////////////middle ware //////////////////////////////////
// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'ejs');
// app.use(methodOverride('_method'))
// app.use(express.urlencoded({ extended: true }));
// app.engine('ejs', ejsMate)

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// //////////////////////////// Session /////////////////////////////////////////////////
//on the reqest object we will now have a session property
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());


// /////////////////////////////////// passport //////////////////////////////////////////////
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
//get people in session and out of session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//allowing user, success, error to be passed for all requests
app.use((req, res, next) => {
    // console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/register', (req,res) => {
    res.render('./users/register.ejs');
})


app.post('/register', async(req,res) => {
   const {email,username,password} = req.body;
   const user = new User({email,username})
    //so they dont have to login again after they register
   const registeredUser = await User.register(user,password)
    req.login(user, function(err) {
    if (err) { return next(err); }
    return res.redirect('/restaurants')
    });
    // console.log(registeredUser)
    // return res.redirect('/restaurants') 
})

app.get('/login', (req,res) => {
    res.render('./users/login.ejs');
})


app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }), (req,res) => {
   res.redirect('/restaurants')
})


app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/restaurants');
  });
});

/////////////////////////////////// middleware //////////////////////////////////////////////
const validateRestaurant = (req, res, next) => {
    const { error } = restaurantSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        console.log(msg);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        console.log(msg);
    } else {
        next();
    }
}

const isLoggedIn = (req,res,next) =>{
  if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

const isOwner = async (req,res,next) =>{
    const { id } = req.params;
    const resturant = await Restaurant.findById(id);
    if (!resturant.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
//   if (!req.restaurant.author.equal(req.user._id)) {
//         req.flash('error', 'not the owner of this resutrant review!');
//         return res.redirect('/restaurants');
//     }
//     next();
}

const isAuthor = (req,res,next) =>{
  if (!restaurant.review.author.equal(req.user._id)) {
        req.flash('error', 'Not the owner of this review!');
        return res.redirect('/restaurants');
    }
    next();
}


/////////////////////////////////// Restaurants //////////////////////////////////////////////

app.get('/', (req, res) => {
  res.send('Hello World!')
})



//seeing all the Restaurants
app.get('/restaurants', async (req, res) => {
    // res.send("here in restaurant")
    // console.log(restaurants);
    const restaurants = await Restaurant.find({});
    res.render('restaurants.ejs', { restaurants })
})


//create Restaurant
app.get('/restaurants/new', isLoggedIn, async (req, res) => {
        // res.send("in new");
        res.render('new.ejs')
})

//create Restaurant
app.post('/restaurants', validateRestaurant,async (req, res) => {
        const restaurant = new Restaurant(req.body.restaurant)
        restaurant.author = req.user._id;
        await restaurant.save();
        // const id = restaurant._id;
        console.log(restaurant)
    res.redirect(`/restaurants/${restaurant._id}`);

    // res.send(restaurant)
})

//VIEW Restaurant by id 
app.get('/restaurants/:id', async (req, res) => {
    // console.log("in view")
    const {id} = req.params;
    const restaurant = await Restaurant.findById(req.params.id).populate({
        //populate author for reviews and populate author for the restaurant
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // res.send(restaurant.author);
    res.render('view.ejs', {restaurant})
})


//edit a Restaurant
app.get('/restaurants/:id/edit', isLoggedIn,isOwner, async (req, res) => {
       console.log(req.Restaurant);

 const {id} = req.params;
    const restaurant = await Restaurant.findById(id);
    // console.log(Restaurants);
    res.render('edit.ejs', { restaurant })
})

//edit a Restaurant
app.put('/restaurants/:id',validateRestaurant,isOwner, async (req, res) => {
    // res.send("put");
    const {id} = req.params;
    await Restaurant.findByIdAndUpdate(id, {...req.body.restaurant});
    // const UpdatedRestaurant =  await Restaurant.findById(id);
    // console.log(`/restaurants/${id}`)
    res.redirect(`/restaurants/${id}`);

})

//delete a Restaurants
app.delete('/restaurants/:id', isLoggedIn, isOwner, async (req, res) => {
    // res.send("IN DELETE")
    const Restaurants = await Restaurant.findByIdAndDelete(req.params.id);
    // console.log("in detlete");
    res.redirect('/restaurants')
})
//////////////////////////// REVIEWS ////////////////////////////////////////////////////////////
app.post('/restaurants/:id/reviews', isLoggedIn, validateReview, async (req, res) => {

    const restaurant = await Restaurant.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    restaurant.reviews.push(review)
    await review.save();
    await restaurant.save();
    res.redirect(`/restaurants/${restaurant._id}`);

})

app.delete('/restaurants/:id/reviews/:reviewId', isLoggedIn, async (req, res) => {
    const { id, reviewId } = req.params;
// The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    await Restaurant.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/restaurants/${id}`);
    // res.send(resturant)

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})