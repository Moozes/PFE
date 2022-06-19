require('./db/mongoose')
const express = require('express')
const accountManagementRouter = require('./routers/accountManagement')
const userRouter = require('./routers/user')
const adminRouter = require('./routers/admin')
const lesionRouter = require('./routers/lesion')
const User = require('./models/user')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT 


// name admin, email khodja.moussa@yahoo.com, password helloadmin, verifiedEmail true, role admin
const createAdmin = async () => {
    try{
        const user =  User({
            name: "admin",
            email: "khodja.moussa@yahoo.com",
            password: "helloadmin",
            verifiedEmail: true,
            role: "admin"
        })
        const admin = await User.findOne({email: "khodja.moussa@yahoo.com"})
        if(!admin){
            await user.save()
        }

    }catch(e) {
        console.log(e)
    }
} 
createAdmin()


app.use(cors())
app.use(express.json())
app.use(accountManagementRouter)
app.use(adminRouter)
app.use(lesionRouter)
app.use(userRouter)
app.use((req, res, next) => {
    res.status(404).send({error: "Not Found!"})
})


app.listen(PORT, () => {
    console.log('server is up on ', PORT)
})