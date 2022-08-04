const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({


  fname: {
    type: String,
    required: true

  },

  lname: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    // valid email,
    unique: true
  },

  profileImage: {
    type: String,
    required: true
  },
  // s3 link
  phone: {
    type: String,
    required: true,
    unique: true,
    // valid Indian mobile number
  },

  password: {
    type: String,
    required: true,
    // minLen 8, maxLen 15
  }, // encrypted password


},   { timestamps : true  }
  
)

module.exports = mongoose.model('createUser', userSchema)