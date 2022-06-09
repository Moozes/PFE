const mongoose = require('mongoose')

const taskSchema = mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        required: true,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    // this will add 2 properties automatically, createdAt, updatedAt
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task