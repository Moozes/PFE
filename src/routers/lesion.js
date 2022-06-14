const express = require('express')
const Lesion = require('../models/lesion')
const auth = require('../middleware/auth')
const authorization = require('../middleware/authorization')
const ROLES = require('../middleware/roles')
const multer = require('multer')
const sharp = require('sharp')


// upload a lesion
const router = express.Router()
const upload = multer({
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
router.post('/lesions', auth, upload.single('image'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).jpeg().toBuffer()
    const lesion = Lesion({
        ...req.body,
        image: buffer,
        owner: req.user._id
    })

    try{
        await lesion.save()
        res.status(201).send(lesion)
    }catch(e){
        res.status(400).send({error: e})
    }
    
}, (error, req, res, next) => {
    // this error handler function is added because multer is throwing errors that are not catched, so this will catch them
    res.status(400).send({error: error.message})
})


router.get('/lesions/:id/image', async (req, res) => {
    try{
        const lesion = await Lesion.findById(req.params.id)
        if(!lesion || !lesion.image)
            throw "Not Found!"

        res.set('Content-Type', 'image/jpg')
        res.send(lesion.image)
    }catch(e) {
        res.status(404).send({error: e})
    }
})


// TODO: maybe sort by newest first
router.get('/lesions', auth, async (req, res) => {
    try{
        await req.user.populate('lesions').execPopulate()
        res.send(req.user.lesions)
    }catch(e) {
        res.status(500).send({error: e})
    }
})

router.delete('/lesions/:id', auth, async (req, res) => {
    try{
        const lesion = await Lesion.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!lesion)
            return res.status(404).send({error: "Not Found!"})
        res.send(lesion)
    }catch(e){
        res.status(500).send({error: e})
    }
})

// this is a general update endpoint, but im only allowing 'published' to be updated
router.patch('/lesions/:id', auth, async (req, res) => {
    const allowedUpdates = ['published']
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every(item => allowedUpdates.includes(item))

    if(!isValidOperation)
        return res.status(400).send({error: "You can only update 'published field'"})

    try{
        const lesion = await Lesion.findOne({_id: req.params.id, owner: req.user._id})
        if(!lesion)
            return res.status(404).send({error: "Not Found!"})
        updates.forEach(update => lesion[update] = req.body[update])
        await lesion.save()
        res.send(lesion)
    }catch(e) {
        res.status(400).send({error: e})
    }
})

router.post('/test', (req, res) => {
    console.log(req.body)
    res.send()
})


module.exports = router