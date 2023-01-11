const Campground=require('../models/campground');
const{cloudinary}=require("../cloudinary")
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapBoxToken})
module.exports.index=async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
    // const camp = new Campground({ title: 'My Backyard', description: 'cheap camping' })
    // const savedcamp=await camp.save();
    // res.send(camp)
}
module.exports.renderNewForm=(req,res)=>{
    res.render('campgrounds/new')
}
module.exports.createCampground=async (req, res, next) => {
    const geoData=await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400);
    const campground = new Campground(req.body.campground);
    campground.geometry=geoData.body.features[0].geometry;
    campground.images=   req.files.map(f=>({url:f.path,filename:f.filename}))
    campground.author=req.user._id;
    await campground.save();
   console.log(campground)
    req.flash('success','succesfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}
module.exports.showCampground=async (req, res) => {
    //const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
        path:'author'
}}).populate('author');
    console.log(campground.reviews)
    if(!campground){
        req.flash('error','cannot find this campground');
        return res.redirect('/campgrounds')
    }
    //console.log(campground);
    res.render('campgrounds/show', { campground });
    //res.send(campground)
}
module.exports.renderEditForm=async (req, res) => {
    const{id}=req.params;
    const campground = await Campground.findById(id);
   
   
    if(!campground){
        req.flash('error','cannot find that campground!');
        return res.redirect('/campgrounds')
    }
   
    res.render('campgrounds/edit', { campground });
}
module.exports.updateCampground=async (req, res) => {
    const { id } = req.params;   
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    // campground.images.push(req.files.map(f=>({url:f.path,filename:f.filename})))//this means we push array inside array
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}));
    campground.images.push(...imgs)
    await campground.save()
    if (req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        console.log("******************")
        await campground.updateOne({$pull:{images:{filename:{ $in:req.body.deleteImages}}}})
        console.log(campground)
    }
    req.flash('success','Succesfully Updated The Campground')
    res.redirect(`/campgrounds/${campground._id}`)
}
module.exports.deleteCampground=async (req, res) => {
    

    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','succesfullydeleted campground' )

    res.redirect('/campgrounds')
}
