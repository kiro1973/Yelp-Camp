const User=require('../models/user');
module.exports.renderRegister=(req,res)=>{
    res.render('users/register')
}
module.exports.register=async(req,res)=>{
    try{
    const{email,username,password}=req.body;
    const user= new User({email,username});
    const registeredUser=await User.register(user,password);
    req.login(registeredUser, function(err) {
        if (err) { return next(err); }
        req.flash('success','welcome to yelp camp')
        res.redirect('/campgrounds')
      });

    }catch(e){
        req.flash('error',e.message);
        res.redirect('/register')
    }
}
module.exports.renderLogin=(req,res)=>{
    console.log("session in get/login:")
        console.log(req.session.id)
        console.log('')
    res.render('users/login')
}
module.exports.login=(req,res)=>{
    console.log("session in post: /login:", req.session.id)
    req.flash('success','welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    console.log("returnTo", req.session.returnTo)
    res.redirect(redirectUrl);
    req.session.returnTo = null;
}
module.exports.logout=(req,res)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success','Goodbye!');
    res.redirect('/campgrounds')
      });
    
}