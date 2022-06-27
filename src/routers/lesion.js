const express = require('express')
const Lesion = require('../models/lesion')
const auth = require('../middleware/auth')
const ROLES = require('../middleware/roles')
const multer = require('multer')
const sharp = require('sharp')
const FormData = require('form-data')
const {adminDoctorAuthorization, adminDoctorOwnerAuthorization} = require('../middleware/authorization')
const uploadToFlask = require('../utils/uploadToFlask')

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
    try{
    if(!req.file)
        throw "Please upload an image"
    const owner = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatarUrl: req.user.avatar ? `/users/${req.user._id}/avatar` : null
    }

    // here you send image to flask and wait result, otherwise throw error
    const response = await uploadToFlask(req.file)

    const buffer = await sharp(req.file.buffer).jpeg().toBuffer()
    const lesion = Lesion({
        ...req.body,
        image: buffer,
        prediction: response.data,
        owner
    })

    
        await lesion.save()
        res.status(201).send(lesion)
    }catch(e){
        console.log("error-----------")
        console.log(e)
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
// Get my lesions
router.get('/lesions', auth, async (req, res) => {
    try{
        await req.user.populate({
            path: 'lesions',
            options: {
                sort: {
                    createdAt: -1
                }
            }
        }).execPopulate()
        res.send(req.user.lesions)
    }catch(e) {
        console.log(e)
        res.status(500).send({error: e})
    }
})

// TODO: maybe sort by newest first
// Get published lesions, this is for doctors and admin
router.get('/lesions/published', auth, adminDoctorAuthorization, async (req, res) => {
    try{
        const publishedLesions = await Lesion.find({published: true}).sort({updatedAt: -1})
        res.send(publishedLesions)
    }catch(e) {
        res.status(500).send({error: e})
    }
})

// delete my lesion
router.delete('/lesions/:id', auth, async (req, res) => {
    try{
        const lesion = await Lesion.findOneAndDelete({_id: req.params.id, "owner._id": req.user._id})
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
        const lesion = await Lesion.findOne({_id: req.params.id, "owner._id": req.user._id})
        if(!lesion)
            return res.status(404).send({error: "Not Found!"})
        updates.forEach(update => lesion[update] = req.body[update])
        await lesion.save()
        res.send(lesion)
    }catch(e) {
        res.status(400).send({error: e})
    }
})


router.post('/lesions/:id/comments', auth, adminDoctorOwnerAuthorization, async (req, res) => {
    try{
        const lesion = await Lesion.findById(req.params.id)
        
        // this is done in authorization middleware
        // if(!lesion)
        //     return res.status(404).send({error: "Not Found!"})

        const comment = {
            user: {
                _id: req.user._id,
                email: req.user.email, 
                name: req.user.name,
                avatarUrl: req.user.avatar ? `/users/${req.user._id}/avatar` : null
            },
            text: req.body.text
        }
        // lesion.comments = lesion.comments.concat(comment)
        lesion.comments = [comment, ...lesion.comments]

        await lesion.save()
        res.status(201).send(lesion)
    }catch(e) {
        console.log(e)
        res.status(400).send({error: e})
    }
})

module.exports = router