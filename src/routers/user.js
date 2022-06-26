const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeMail, sendRandomCode } = require('../email/account')
const generateRandomCode = require('../utils/generateRandom')
const ROLES = require('../middleware/roles')

const router = express.Router()




router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password']
    const isValidOperation = updates.every(item => allowedUpdates.includes(item))
    let emailChanged = false

    if(!isValidOperation)
        return res.status(400).send({error: 'Cant update those properties'})

    // if email changed reset verifiedEmail to false and resend verification code
    if(updates.includes('email')){
        emailChanged = req.user.email !== req.body.email
    }
    try {

        updates.forEach(update => req.user[update] = req.body[update])

        await req.user.save()

        // if email changed reset verifiedEmail to false and send email verification code 
        if(emailChanged) {
            console.log('email changed---------------')
            req.user.verifiedEmail = false
            const randomCode = generateRandomCode(4)
            // sendRandomCode(req.user.email, randomCode)
            req.user.latestVerificationCode = randomCode
        }

        // to save latest verification code
        await req.user.save()

        res.send(req.user)
    }catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        console.log('deleteing........')
        // const user = await User.findByIdAndDelete(req.params.id)
        // if(!user)
        //     return res.status(404).send('No user with that id')
        await req.user.remove()

        // cascade delete all related tasks also
        // await Task.deleteMany({owner: req.user._id})
        // ---------OR--------
        // we use a middleware in a pre remove event, so if we delete a user anywere else the middleware executes and we dont have to repeat Task.deleteMany
        // the middleware is defined in userSchema.pre('remove', async function() {})

        res.send(req.user)
    }catch(e) {
        console.log(e)
        res.status(500).send(e)
    }
})

// upload/delete/serve user image ------------------------------
const upload = multer({
    // dest: "avatars", you need to remove dest so you can access binary file data in router handler function "req.file.buffer" to save it to mongodb, we dont save it to the file system because each deployement deletes all files
    limits: {
        fileSize: 2000000
    },
    fileFilter(req, file, cb) {
        // cb is short for callback
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
            return cb(new Error('Please upload an image'))
        cb(undefined, true)
    }
})
// upload user image
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // making image smaller 250x250 and converting to unified format (png)
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).jpeg().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    // this error handler function is added because multer is throwing errors that are not catched, so this will catch them
    res.status(400).send({error: error.message})
})

// delete user image
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    try{
        await req.user.save()
        res.send()
    }catch(e) {
        res.status(500).send({error: "server error"})
    }
})

// serve user image as url instead of binary
router.get('/users/:id/avatar', async (req, res) => {
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar)
            throw "Not Found"

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    }catch(e) {
        res.status(404).send({error: e})
    }
})


// read all doctors
router.get('/users/doctors', auth, async (req, res) => {
    try{
        const doctors = await User.find({role: ROLES.DOCTOR})
        res.send(doctors)
    }catch(e) {
        console.log(e)
        res.status(500).send({error: e})
    }
})


module.exports = router