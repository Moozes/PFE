// you specify access by passing this middleware as
// authorization([ROLES[0], ROLES[1]]) for admin and doctors only
// or 
// authorization([ROLES[0], ROLES[2]]) for admin and users only


// permissions:
//     admin: [ROLES[0]]
//     doctor: [ROLES[0], ROLES[1]] because admin can do what a doctor can

//     user: [ROLES[0], ROLES[1], ROLES[2]] because admin and doctor can do what a user can
//     or
//     user: no middleware used, just authentication required

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