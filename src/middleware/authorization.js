const authorization = (allowedRoles) => (req, res, next) => {
    try{
        if(!allowedRoles.includes(req.user.role))
            throw new Error()
        // if(req.user.role !== role)
        //     throw new Error()
        next()
    }catch(e) {
        res.status(403).send({error: "Not Allowed!"})
    }
}

module.exports = authorization