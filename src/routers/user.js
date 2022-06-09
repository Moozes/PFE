const express = require('express')
const User = require('../models/user')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeMail, sendRandomCode } = require('../email/account')
const generateRandomCode = require('../utils/generateRandom')


const router = express.Router()


// create user - signup
router.post('/users', async (req, res) => {
    const user = User(req.body)

    try{
        await user.save()
        sendWelcomeMail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    }catch(e) {
        res.status(400).send(e)
    }
})

// Login
router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }catch(e) {
        console.log(e)
        res.status(400).send({error: e})
    }
})

// logout of a single session
router.post('/users/logout', auth, async (req, res) => {
    try{
        // we dont delete all tokens so the user can stay logged in on other machines (phone, tablet...)
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()
        res.send() // just sending a status of 200
    }catch(e){
        res.status(500).send(e)
    }
})

// logout of all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()// just sending a status of 200
    }catch(e){
        res.status(500).send(e)
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every(item => allowedUpdates.includes(item))

    if(!isValidOperation)
        return res.status(400).send({error: 'Cant update those properties'})

    try {
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        // const user = await User.findById(req.params.id)

        
        // if(!user)
        //     return res.status(404).send('No user with that id!')

        updates.forEach(update => req.user[update] = req.body[update])

        await req.user.save()

        res.send(req.user)
    }catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
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
        fileSize: 1000000
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
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
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
        res.status(500).send()
    }
})

// serve user image as url instead of binary
router.get('/users/:id/avatar', async (req, res) => {
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar)
            throw new Error('Not Found!')

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }catch(e) {
        res.status(404).send({error: e})
    }
})



// reset password-----------------------------
// POST {email}
router.post('/send-code', async (req, res) => {
    try{
        const user = await User.findOne({email: req.body.email})
        if(!user)
            return res.status(404).send({error: "not found"})
        
        const randomCode = generateRandomCode(4)
        // send email, if success, save random code in db, send 200 ok
        const info = await sendRandomCode(user.email, randomCode)
        user.latestResetPasswordCode = randomCode
        await user.save()
        res.send()
    }catch(e) {
        res.status(400).send()
    }
})

// POST {email, code, newPassword}
// the email here is sent by front end and not user
router.post('/reset-password', async (req, res) => {
    const {email, code, newPassword} = req.body
    try{
        const user = await User.findOne({email})
        if(!user)
            return res.status(404).send({error: "not found"})
        // extract code from db, if equal reset password
        if(!code === user.latestResetPasswordCode)
            throw new Error()

        user.password = newPassword
        // this could throw validation errors, that is why i ran user.save() 2 times
        // i dont want the latestResetPasswordCode to be removed until the new password is valid   
        await user.save()
        // if you want to remove latestResetPasswordCode from db 
        user.latestResetPasswordCode = undefined
        await user.save()
        res.send()
    }catch(e) {
        res.status(400).send(e)
    }
})



module.exports = router