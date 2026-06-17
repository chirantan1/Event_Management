require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI)
.then(async()=>{

  await User.deleteOne({
    email:"admin@example.com"
  });

  const admin = new User({
    name:"Admin User",
    email:"admin@example.com",
    password:"Admin@123",
    phone:"1234567890",
    role:"admin",
    isAdmin:true,
    isActive:true
  });

  await admin.save();

  console.log("Admin created successfully");
  process.exit();

})
.catch(err=>{
  console.log(err);
  process.exit(1);
});