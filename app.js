if(process.env.NODE_ENV !=="production"){
    require('dotenv').config();
}

console.log(process.env.SECRET)
console.log(process.env.API_KEY)
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose')
const flash=require('connect-flash')
const passport=require('passport');
const localStrategy=require('passport-local')
const Campground = require('./models/campground');
const User=require('./models/user')
const helmet=require('helmet')
const session=require('express-session');
const methodOverride=require('method-override');
const ejsMate=require('ejs-mate');
const { campgroundSchema, reviewSchema }=require('./schemas')
const catchAsync=require('./utils/catchAsync');
const ExpressError=require('./utils/ExpressError');
const Review=require('./models/review')
const campgroundRoutes=require('./routes/campgrounds');
const reviewRoutes=require('./routes/reviews');
const userRoutes=require('./routes/users')
const mongoSanitize = require('express-mongo-sanitize');

const MongoStore = require('connect-mongo');
app.engine('ejs',ejsMate)
const dbUrl=process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
//'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,

    useUnifiedTopology: true,
   // useFindAndModify:false
    //useCreateIndex: true,
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database conncted")
});



app.use(express.urlencoded({extended:true}));
app.use (methodOverride('_method'))


app.use(express.static(path.join(__dirname,'public')))

const secret=process.env.SECRET || 'thisshouldbeabettersecret';
const store=MongoStore.create({
    mongoUrl:dbUrl,
    secret,
    touchAfter:24*60*60 //mohemma
})
store.on("error",function(e){
    console.log("SESSION STORE ERROR",e)
})

const sessionConfig={
    store:store,
    name:'KAKAKAKA',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        //secure:true, //https://www.udemy.com/course/the-web-developer-bootcamp/learn/lecture/22348120#overview
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
    
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(helmet({
    crossOriginResourcePolicy: false,
  }));
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dv4w6vggf/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
//    console.log(req.session.returnTo);
    //console.log(req.query);
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
});

app.use('/',userRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)
app.use('/campgrounds',campgroundRoutes)

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/fakeUser',async(req,res)=>{
    const user=new User({email:'kerra@gmail.com',username:'kerra'});
    const newUser=await  User.register(user,'chcken');
    res.send(newUser);
})
app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
})

app.use((err,req,res,next)=>{
    // const{statusCode=500,message='Something Went Wrong'}=err;
    if (!err.message)err.message='Oh No,Something went wrong';
    if (!err.statusCode)err.statusCode=500;
    
    res.status(err.statusCode).render('partials/error',{err})
   
})
const port=process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on Port ${port}`)
})