const Lesion = require('../models/lesion')
const ROLES = require('./roles')

// const authorization = (allowedRoles) => (req, res, next) => {
//     try{
//         if(!allowedRoles.includes(req.user.role))
//             throw new Error()
//         next()
//     }catch(e) {
//         res.status(403).send({error: "Not Allowed!"})
//     }
// }

// const commentAuthorization = (allowedRoles) => async (req, res, next) => {
//     try{
//         let isOwner = false
//         const hasRequiredRole = allowedRoles.includes(req.user.role)

//         // check if commenter is owner of comment
//         const lesion = await Lesion.findById(req.params.id)
//         if(!lesion)
//             return res.status(404).send({error: "Not Found!"})
//         if(lesion.owner.equals(req.user._id))
//             isOwner = true

//         // check if doctor is verified, but if owner he can comment
//         if(!isOwner)
//             if(req.user.role === ROLES[1] && !req.user.verifiedDoctor)
//                 throw "You doctor account is not verified, contact admin khodja.moussa@yahoo.com" 

//         if(!hasRequiredRole && !isOwner)
//             throw "Not Allowed!"
//         // if(req.user.role !== role)
//         //     throw new Error()
//         next()
//     }catch(e) {
//         res.status(403).send({error: e})
//     }
// }

// const getPublishedAuthorization = (allowedRoles) => async (req, res, next) => {
//     try{
//         if(req.user.role === ROLES[1] && !req.user.verifiedDoctor)
//             throw "You doctor account is not verified, contact admin khodja.moussa@yahoo.com" 

//         if(!allowedRoles.includes(req.user.role))
//             throw "Not Allowed!"
//         next()
//     }catch(e) {
//         res.status(403).send({error: e})
//     }
// }




// admin only
const adminAuthorization = (req, res, next) => {
    try{
        if(req.user.role !== ROLES.ADMIN)
            throw "Not Authorized, Admin only!"
        next()
    }catch(e) {
        res.status(403).send({error: e})
    }
}

// admin & verified doctor only
const adminDoctorAuthorization = (req, res, next) => {
    try{
        if(req.user.role === ROLES.DOCTOR && !req.user.verifiedDoctor)
            throw "Not Authorized, you are not a verified doctor"

        if(req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.DOCTOR)
            throw "Not Authorized, Admin & Doctors only"
        next()
    }catch(e) {
        res.status(403).send({error: e})
    }
}

// admin & verified doctor & owner of lesion only
const adminDoctorOwnerAuthorization = async (req, res, next) => {
    try{
        // check if commenter is owner of comment
        const lesion = await Lesion.findById(req.params.id)
        if(!lesion)
            return res.status(404).send({error: "Not Found!"})
        if(lesion.owner._id.equals(req.user._id))
            return next()

        // not owner, check if verified doctor
        if(req.user.role === ROLES.DOCTOR && !req.user.verifiedDoctor)
            throw "Not Authorized, you are not a verified doctor"

        if(req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.DOCTOR)
            throw "Not Authorized, Admin & Doctors & Owner only"
        next()
    }catch(e) {
        res.status(403).send({error: e})
    }


}



module.exports = {
    adminAuthorization,
    adminDoctorAuthorization,
    adminDoctorOwnerAuthorization
}


