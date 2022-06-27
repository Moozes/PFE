const express = require('express')
const auth = require('../middleware/auth')
const Message = require('../models/message')
const User = require('../models/user')

const router = express.Router()

router.post('/messages/:id', auth, async (req, res) => {
    const receiver_id = req.params.id

    try {
        const receiver = await User.findById(receiver_id)
        if(!receiver)
            throw "Receiver Not Found!"

        const message = Message(req.body)
        message.receiver = {
            _id: receiver._id,
            email: receiver.email, 
            name: receiver.name,
            avatarUrl: receiver.avatar ? `/users/${receiver._id}/avatar` : null
        }
        message.sender = {
            _id: req.user._id,
            email: req.user.email, 
            name: req.user.name,
            avatarUrl: req.user.avatar ? `/users/${req.user._id}/avatar` : null
        }
        await message.save()
        res.status(201).send(message)
    }catch(e) {
        res.status(404).send({error: e})
    }
})


router.get('/messages/:id', auth, async (req, res) => {
    const doctor_id = req.params.id

    try {
        const doctor = await User.findById(doctor_id)
        if(!doctor)
            throw "Doctor Not Found!"

        const messages = await Message.find({
            $or: [
                {'sender._id': req.user._id, 'receiver._id': doctor._id},
                {'sender._id': doctor._id, 'receiver._id': req.user._id},
            ]
        })
        res.status(200).send(messages)
    }catch(e) {
        res.status(404).send({error: e})
    }
})


module.exports = router