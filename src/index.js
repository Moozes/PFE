require('./db/mongoose')
const express = require('express')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const PORT = process.env.PORT //|| 3001 removed because we have an environment variable now in dev.env

// a middleware always above the other calls for app.use()
// app.use((req, res, next) => {
//     if(req.method === 'GET')
//         res.send({error: 'GET Not Allowed'})
//     else
//         next()
// })

// app.use((req, res, next) => {
//     res.status(503).send({error: 'This Site is in Maintenance'})
// })



// const multer = require('multer')
// const upload = multer({
//     dest: 'images',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb) {
//         if(!file.originalname.match(/\.(doc|docx)$/))
//             return cb(new Error('Please upload a Word document'))
//         cb(undefined, true)
//     }
// })
// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send()
// }, (error, req, res, next) => {
//     res.status(400).send({error: error.message})
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(PORT, () => {
    console.log('server is up on ', PORT)
})



// const Task = require('./models/task')
// const User = require('./models/user')

// const foo = async () => {
//     // const task = await Task.findById('628aad0ce81979989d9ef067')
//     // await task.populate('owner').execPopulate()
//     // console.log(task.owner)
    
//     const user = await User.findById('628aabe896b3e89593e8d7a3')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }

// foo()