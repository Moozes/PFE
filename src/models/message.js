const mongoose = require('mongoose')

const messageSchema = mongoose.Schema({
    text: {
        type: String,
        trim: true
    },
    sender: {
        _id: mongoose.Schema.Types.ObjectId,
        email: String,
        name: String,
        avatarUrl: String
    },
    receiver: {
        _id: mongoose.Schema.Types.ObjectId,
        email: String,
        name: String,
        avatarUrl: String
    },
}, {
    timestamps: true
})

messageSchema.methods.toJSON = function() {
    const message = this
    const messageObject = message.toObject()

    return messageObject
}

const Message = mongoose.model('Message', messageSchema)

module.exports = Message