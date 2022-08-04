const userModel = require('../models/userModel')
const validator = require('../validator/validators')
const aws = require('../validator/awsS3')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")


/********************** USER REGISTER ******************/

const register = async (req, res) => {
  try {

    if (!validator.isValidRequestBody(req.body)) {
      return res.status(400).send({
        status: false,
        message: 'invalid Input Parameters'
      })
    }

    let {
      fname,
      lname,
      email,
      phone,
      password,
      address
    } = req.body

    let files = req.files;
    let uploadedFileURL



    if (!validator.isValid(fname)) {

      return res
        .status(400)
        .send({
          Status: false,
          Message: 'invalid First Name'
        })
    }

    if (!validator.isValidCharacters(fname.trim())) {
      return res.status(400).send({
        Status: false,
        msg: "This attribute can only have letters as input"
      })
    }



    if (!validator.isValid(lname.trim())) {
      return res.status(400).send({
        Status: false,
        message: 'invalid last Name'
      })
    }

    if (!validator.isValidCharacters(lname)) {
      return res.status(400).send({
        Status: false,
        msg: "This attribute can only have letters as input"
      })
    }



    if (!validator.isValid(email)) {
      return res.status(400).send({
        status: false,
        message: 'email is required'
      })
    }

    if (!validator.isValidEmail(email)) {
      return res.status(400).send({
        status: false,
        message: 'please enter a valid email'
      })
    }

    let isEmailExist = await userModel.findOne({
      email
    })
    if (isEmailExist) {
      return res.status(400).send({
        status: false,
        message: `This email ${email} is Already In Use`
      })
    }

    if (!validator.isValid(phone)) {
      return res.status(400).send({
        Status: false,
        msg: "Please provide phone number"
      })
    }
    if (!validator.isValidPhone(phone)) {
      return res.status(400).send({
        status: false,
        message: 'Enter A valid phone Nummber'
      })
    }

    let isPhoneExist = await userModel.findOne({
      phone
    })
    if (isPhoneExist) {
      return res.status(400).send({
        status: false,
        message: `This Phone ${phone} No. is Already In Use`
      })
    }

    if (!validator.isValid(password)) {
      return res.status(400).send({
        status: false,
        message: 'password Is Required'
      })
    }

    if (!validator.isvalidPass(password.trim())) {
      return res.status(400).send({
        status: false,
        message: `password Should Be In Beetween 8-15 `
      })
    }

    let hashedPassword = await validator.hashedPassword(password.trim())
    console.log(hashedPassword.length)



    //UploadingFile..............................................................

    if (validator.isValidFiles(files)) {
      if (!validator.isValidImage(files[0])) {
        return res.status(400).send({
          status: false,
          msg: `invalid image type`
        })
      }
      uploadedFileURL = await aws.uploadFile(files[0]);
    } else {
      return res.status(400).send({
        status: false,
        msg: "Please provide a profile image"
      });
    }

    let finalData = {
      fname: fname,
      lname,
      email,
      profileImage: uploadedFileURL,
      phone,
      password: hashedPassword,
      address
    }

    const newUser = await userModel.create(finalData)
    return res.status(201).send({
      status: true,
      message: 'Success',
      Data: newUser
    })

  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}


/******************* USER LOGIN ************************/

const userLogin = async function (req, res) {
  try {

    if (!validator.isValidRequestBody(req.body)) {
      return res.status(400).send({
        status: false,
        msg: "data required for login"
      })
    }
    let email = req.body.email
    let password = req.body.password.trim()

    if (!validator.isValid(email)) {
      return res.status(400).send({
        status: false,
        msg: "email is required"
      })

    }

    if (!validator.isValidEmail(email)) {
      return res.status(400).send({
        Status: false,
        msg: "please provide valid email id"
      })
    }


    if (!validator.isValid(password)) {
      return res.status(400).send({
        status: false,
        msg: "password is required"
      })
    }

    let user = await userModel.findOne({
      email
    })

    if (!user) {
      return res.status(404).send({
        status: false,
        msg: "email not found"
      })
    }


    let match = await bcrypt.compare(password, user.password)

    if (match) { //after decrypting

      let token = jwt.sign({
          userId: user._id.toString(),
        },
        "Assignment", {
          expiresIn: "3 hrs"
        }
      );
      // res.setHeader("Authorization", "Bearer"+" "+token)
      res.status(200).send({
        status: true,
        data: {
          userId: user._id,
          token: token
        }
      })

    } else {
      return res.status(400).send({
        Status: false,
        msg: "Incorrect Password"
      })
    }
  } catch (err) {
    return res.status(500).send({
      Status: false,
      msg: err.message
    })

  }
}


/********************* UPDATE USER **********************/

const updateProfile = async (req, res) => {
  try {
    const {
      userId
    } = req.params
    if (!validator.isValidObjectId(userId)) {
      return res.status(400).send({
        status: false,
        message: "Please provide valid user ID"
      })
    }
    const data = req.body //JSON.parse(JSON.stringify(req.body)) 
    const files = req.files
    const {
      password
    } = data

    if (!Object.keys(data).length > 0)
      return res.send({
        status: false,
        message: "Please enter data for updation"
      })

    const isUserExist = await userModel.findById(userId)
    if (!isUserExist) {
      return res.status(404).send({
        status: false,
        message: "user not found"
      })
    }

    if (data._id) {
      return res.status(400).send({
        status: false,
        message: "can not update user id"
      })
    }
    if (data.email) {
      // const isEmailInUse = await userModel.findOne({ email: data.email })
      if (!validator.isValidEmail) {
        return res.status(400).send({
          status: false,
          message: "email already registered, enter different email"
        })
      }
    }
    if (data.phone) {
      if (!validator.isValidPhone) {
        return res.status(400).send({
          status: false,
          message: "phone number already registered, enter different number"
        })
      }
    }

    if (files.length > 0) {
      if (files[0].mimetype.indexOf('image') == -1)
        return res.status(400).send({
          status: false,
          msg: "Only image files are allowed !"
        })

      const link = await uploadFile(files[0])
      data.profileImage = link

      // console.log(link)
    }
    let salt = 10
    if (password) {
      const hash = await bcrypt.hash(password, salt)
      data.password = hash
    }
    
    const updateUser = await userModel.findOneAndUpdate({
      _id: userId
    }, data, {
      new: true
    })
    return res.status(200).send({
      status: true,
      msg: `updated successfully !`,
      data: updateUser
    })
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}


/**************************** DELETE USER ***************************/

const deleteUser = async function (req, res) {
  try {
      let uid = req.params.UserId
      if (!validator.isValidObjectId(uid)) {
          return res.status(400).send({
              Status: false,
              msg: "Please provide valid User id"
          })
      }


      let user = await userModel.findById(uid)

      if (!user) {
          return res.status(404).send({
              Status: false,
              msg: "User not found"
          })
      }

      if (user.isDeleted === true) {
          return res.status(400).send({
              Status: false,
              msg: "User already deleted"
          })
      }


      let deletedUser = await userModel.findByIdAndUpdate(uid, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })

      return res.status(200).send({
          Status: true,
          message: "Success",
          Data: deletedUser
      })


  } catch (err) {
      return res.status(500).send({
          Status: false,
          msg: err.message
      })
  }

}


module.exports = {
  register,
  userLogin,
  updateProfile,
  deleteUser
}