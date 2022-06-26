const mongoose = require('mongoose')

const lesionSchema = mongoose.Schema({
    image: {
        type: Buffer,
        required: true
        // validation done by multer
    },
    description: {
        type: String,
        trim: true
    },
    published: {
        type: Boolean,
        default: false
    },
    // TODO: add comments sub shcema here
    comments: [{
        user: {
            _id: mongoose.Schema.Types.ObjectId,
            email: String,
            name: String
        },
        text: {
            type: String,
            required: true
        }
    }],
    owner: {
        _id: mongoose.Schema.Types.ObjectId,
        email: String,
        name: String,
        avatarUrl: String
    }
}, {
    // this will add 2 properties automatically, createdAt, updatedAt
    timestamps: true
})

lesionSchema.methods.toJSON = function() {
    const lesion = this
    const lesionObject = lesion.toObject()

    if(lesion.image)
        lesionObject.imageUrl = `/lesions/${lesionObject._id}/image`
    else
        lesionObject.imageUrl = null
    
    delete lesionObject.image

    return lesionObject
}

const Lesion = mongoose.model('Lesion', lesionSchema)

module.exports = Lesion