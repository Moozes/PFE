const authorization = (role) => (req, res, next) => {
    try{
        if(req.user.role !== role)
            throw new Error()
        next()
    }catch(e) {
        res.status(403).send({error: "Not Allowed!"})
    }
}

module.exports = authorization