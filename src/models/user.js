const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Lesion = require('./lesion')
const ROLES = require('../middleware/roles')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true,
        validate(value) {
            if(!validator.isEmail(value)) throw new Error('Invalid Email Format')
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        // minLength: 7,
        validate(value) {
            const ispassword = value === 'password' // this needs to be changed, use includes function
            const isShort = !validator.isLength(value, {min: 7})
            if(ispassword) throw new Error('password cant contain the word password')
            if(isShort) throw new Error('Password length must be > 6')
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
        // not required
        // validation done by multer
    },
    latestResetPasswordCode: {
        type: String
    },
    latestVerificationCode: {
        type: String
    },
    verifiedEmail: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        required: true,
        enum: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.USER]
    },
    verifiedDoctor: {
        type: Boolean,
        default: false
    }
}, {
    // this will add 2 properties automatically, createdAt, updatedAt
    timestamps: true
})

// a virtual field means that data isnt really stored in the data base, it is just a relationship
userSchema.virtual('lesions', {
    ref: 'Lesion',
    localField: '_id',
    foreignField: 'owner._id'
})

// toJSON is already defined by mongoose, here we are redifining it to not return password and tokens 
// this method is called automatically when passing mongoose document to res.send()
userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject() // returns a clone, not the user pointer

    // construct the image url for frontend use, and we dont want to return avatar binary data
    // -----or----
    // if avatar is undefined we can set a default url to a default static image saved in the server's file system 
    if(user.avatar)
        userObject.avatarUrl = `/users/${userObject._id}/avatar`
    else
        userObject.avatarUrl = null
    
    delete userObject.avatar
    delete userObject.password
    delete userObject.tokens
    delete userObject.latestVerificationCode
    delete userObject.latestResetPasswordCode
    delete userObject.verifiedEmail

    return userObject
}


userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    
    user.tokens = user.tokens.concat({token})
    await user.save()
    
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})

    if(!user)
        throw 'Email Not Found!'

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch)
        throw 'Wrong Password!'

    return user
}

// hash password before saving it to the database
userSchema.pre('save', async function(next) {
    const user = this

    if(user.isModified('password'))
        user.password = await bcrypt.hash(user.password, 8)

    next()
})

// to cascade delete all related tasks
userSchema.pre('remove', async function(next) {
    const user = this
    await Lesion.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User