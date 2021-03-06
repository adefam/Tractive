const express = require("express");
const Owner = require("../models/ownersModel"); 
const bcrypt = require("bcryptjs");
const jwt       = require("jsonwebtoken"); 
// const passport = require("passport"); 

const {signUp, signIn} = require("../middlewares/validation"); 


const getOwners = async (req, res, next) => {
    Owner.find()
    .then(data => res.json(data)) 
    .catch(error => res.status(400).json("Error: " + error)); 
};

//   signup 
const ownerApplication = async (req, res) => {    
    const {error} = signUp(req.body) 
    if (error) {
        return res.status(400).send(error.details[0].message)
    } 
    const existingEmail = await User.findOne({email : req.body.email})

    if (existingEmail) {
        return res.status(400).send('Email already exists')
    }
    const saltPassword = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, saltPassword)

    const {title, address, town, state,  role, fullName, gender, email, phone,  country, firmAddress, password,  } = req.body

    const newOwner = new Owner({
        title, address, town, state,  role, fullName, gender, email, phone,  country, firmAddress,
        password: hashedPassword,
        
    })

    newOwner
    .save()
    .then((data) =>{
        res.json(data);
    })
    .catch((error) =>{
        console.log(error); 
    });
};

// sign-in
const ownerLogin = async (req, res, next) => {
    const {error} = signIn(req.body) 
    if (error) {
        return res.status(400).send(error.details[0].message)
    }
 
    const correctEmil = await Owner.findOne({email : req.body.email})
    if(!correctEmil){
        return res.status(400).send("Email not exist!")
    }

    const correctPassword = await bcrypt.compare(req.body.password, correctEmil.password)
    if(!correctPassword){
        return res.status(400).send("Incorrect Password")
    }

    const sessionToken = jwt.sign({_id:correctEmil.id}, process.env.MY_SECRET_TOKEN)

    if(correctEmil && correctPassword){
    // res.header('authentication-id', sessionToken).json(sessionToken)
    res.json(`${correctEmil.fullName} signed in successfully`); 
    }
   
};

// logout
const ownerLogout = async (req, res, next) => {
    if (req.session) {
        req.session.destroy((err) => {
        if(err) {
          return next(err);
        } else {
            res.json(`Logged out successfully`);
        }
      });
    }
  };


// logout with passport
// const userLogout = async (req, res) => {
//         req.logout();
//         // res.redirect('/');
//    res.json(`Logged out successfully`);
// }


module.exports = {
    ownerLogin,
    ownerApplication,
    getOwners, 
    ownerLogout
}; 
  