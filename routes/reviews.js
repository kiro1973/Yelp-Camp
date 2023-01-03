const express = require('express');
const router = express.Router({mergeParams:true});
const catchAsync=require('../utils/catchAsync');
const campgrounds=require('../routes/campgrounds');
const reviews=require('../controllers/reviews');
const {reviewSchema}=require('../schemas')
const{validateReview,isLoggedIn,isReviewAuthor}=require('../middleware')
const Campground = require('../models/campground');
const Review=require('../models/review')



router.post('/',isLoggedIn,validateReview,catchAsync(reviews.createReview))
    

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview))

module.exports=router;