const jwt = require('jsonwebtoken')
const User = require('../models/user')


// error is thrown when 
// there is no Authorization header, thrown by replace  when trying to access undefined
// token non valid, thrown by jwt.verify
// there is no user with that id or with that token in the database, thrown by us with throw new Error()
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decode._id, 'tokens.token': token})

        if(!user)
            throw new Error()
    
        // this line allows the route handler function to access user without having to fetch again from database
        req.token = token
        req.user = user
        next() // next makes node know that this middleware is done, so it can execute the other functions, if no next was called the other functions wont execute
    }catch(e) {
        res.status(401).send({error: 'please authenticate'})
    } 
}

module.exports = auth