const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = express.Router()


router.post('/tasks', auth, async (req, res) => {
    // const task = Task(req.body)
    const task = Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    }catch(e) {
        console.log(e)
        res.status(400).send(e)
    }

})

// GET /tasks?completed=true or false, for filtering
// GET /tasks?limit=10&skip=20, for pagination to get the 3rd page of data
// GET /tasks?sortBy=createdAt:asc or desc, for sorting 
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.completed)
        match.completed = req.query.completed === 'true'

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
    }

    try {
        // const tasks = await Task.find({owner: req.user._id})
        // res.send(tasks)
        // --------OR-----------
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({_id, owner: req.user._id})
        if(!task)
            return res.status(404).send()
        
            res.send(task)
    }catch(e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(item => allowedUpdates.includes(item))

    if(!isValidOperation)
        return res.status(400).send({error: 'You cant updates those properties'})

    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        // const task = await Task.findById(req.params.id)
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        
        if(!task)
            return res.status(404).send('there is no task with that id')
        
        updates.forEach(update => task[update] = req.body[update])
        await task.save()

        res.send(task)

    }catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!task)
            return res.status(404).send('No task with that id')
        res.send(task)
    }catch(e) {
        res.status(500).send(e)
    }
})


module.exports = router