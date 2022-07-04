const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeMail, sendRandomCode } = require('../email/account')
const generateRandomCode = require('../utils/generateRandom')


const router = express.Router()


// create user - signup
router.post('/users', async (req, res) => {
    const user = User(req.body)
    
    try{
        // users can only signup as doctor or user, admin role cant be chosen
        const allowedRoles = ['doctor', 'user']
        if(!allowedRoles.includes(user.role))
            throw 'role can be doctor or user'


        // need to save before sending email to see if there are any validation errors
        await user.save()

        // send verification code email, save random code in db, send 200 ok
        const randomCode = generateRandomCode(4)
        sendRandomCode(user.email, randomCode)
        user.latestVerificationCode = randomCode

        // generateAuthToken will save a second time
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    }catch(e) {
        res.status(400).send({error: e})
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

// verify email
router.post('/verify', async (req, res) => {
    const {email, code} = req.body
    try{
        const user = await User.findOne({email})
        if(!user)
            return res.status(404).send({error: "not found"})
        // extract code from db, if equal reset password
        if(!(code === user.latestVerificationCode))
            throw "Wrong Code"

        user.verifiedEmail = true
        // this could throw validation errors, that is why i ran user.save() 2 times
        // i dont want the latestResetPasswordCode to be removed until the new password is valid   
        await user.save()
        // if you want to remove latestResetPasswordCode from db 
        // user.latestResetPasswordCode = undefined
        // await user.save()
        res.send()
    }catch(e) {
        res.status(400).send({error: e})
    }
})

// reset password-----------------------------
// POST {email}
router.post('/send-reset-code', async (req, res) => {
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
        res.status(400).send({error: e})
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
        if(!(code === user.latestResetPasswordCode))
            throw "Wrong Code"

        user.password = newPassword
        // this could throw validation errors, that is why i ran user.save() 2 times
        // i dont want the latestResetPasswordCode to be removed until the new password is valid   
        await user.save()
        // if you want to remove latestResetPasswordCode from db 
        // user.latestResetPasswordCode = undefined
        // await user.save()
        res.send()
    }catch(e) {
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





module.exports = router