const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const authorization = require('../middleware/authorization').authorization
const commentAuthorization = require('../middleware/authorization').commentAuthorization
const ROLES = require('../middleware/roles')
const Lesion = require('../models/lesion')


const router = express.Router()

router.post('/lesions/:id/comments', auth, commentAuthorization([ROLES[0], ROLES[1]]), async (req, res) => {
    try{
        const lesion = await Lesion.findById(req.params.id)
        if(!lesion)
            return res.status(404).send({error: "Not Found!"})

        const comment = {
            user: {
                _id: req.user._id,
                email: req.user.email, 
                name: req.user.name
            },
            text: req.body.text
        }
        lesion.comments = lesion.comments.concat(comment)

        await lesion.save()
        res.status(201).send(lesion)
    }catch(e) {
        console.log(e)
        res.status(400).send({error: e})
    }
})

router.get('/test', (req, res) => {
    res.send("hello from doctor.js")
})

module.exports = router