const express = require('express')
const Lesion = require('../models/lesion')
const auth = require('../middleware/auth')
const authorization = require('../middleware/authorization')
const ROLES = require('../middleware/roles')
const multer = require('multer')


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
router.post('/lesions', upload.single('image'), (req, res) => {
    console.log(req.file)
    console.log(req.body.description)
    res.send('ok')
}, (error, req, res, next) => {
    // this error handler function is added because multer is throwing errors that are not catched, so this will catch them
    res.status(400).send({error: error.message})
})


router.get('/lesions/:id/image', async (req, res) => {
    try{
        const lesion = await Lesion.findById(req.params.id)
        if(!lesion || !lesion.image)
            throw new Error('Not Found!')

        res.set('Content-Type', 'image/jpg')
        res.send(lesion.image)
    }catch(e) {
        res.status(404).send({error: e})
    }
})


module.exports = router