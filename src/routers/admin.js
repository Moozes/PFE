const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const {adminAuthorization} = require('../middleware/authorization')


const router = express.Router()


router.get('/users', auth, adminAuthorization, async (req, res) => {
    try{
        const users = await User.find({})
        res.send(users)
    }catch(e) {
        console.log(e)
        res.status(500).send({error: e})
    }
})

// this route has a conflict with the other route users/me 
router.delete('/users/:id', auth, adminAuthorization, async (req, res) => {
    try {
        // const task = await Task.findByIdAndDelete(req.params.id)
        const user = await User.findOneAndDelete({_id: req.params.id})
        if(!user)
            return res.status(404).send('No user with that id')
        res.send(task)
    }catch(e) {
        res.status(500).send(e)
    }
})



// TODO: make it a general update route with patch method but only allow verifiedDoctor to be updated 
router.post('/users/:id/verifyDoctor',auth, adminAuthorization, async (req, res) => {
    try{
        const user = await User.findById(req.params.id)
        if(!user)
            throw new Error()
        user.verifiedDoctor = !user.verifiedDoctor
        await user.save()
        res.send()
    }catch(e) {
        res.status(404).send({error: "Not Found"})
    }
})


module.exports = router