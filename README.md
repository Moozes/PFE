# PFE back

## Run the App localy
    launch a local mongodb database on port 27017  
    npm install  
    npm run dev

## a  REST API with
    ### signup (CEATE)
    ### login
    ### logout
    ### logout off all sessions
    ### jwt authentications with Authorisation header (Bearer)
    ### read my profile (READ)
    ### update my profile (UPDATE)
    ### delete my profile (DELETE)
    ### upload profile image, save in DB, serve as URL
    ### send welcome email
    ### forget password, send random code in mail
    ### user input validation using mongoose
    ### password hash
    ### filtering, pagination, ordering in GET /tasks?--options--
## Note
config folder need to be added to .gitignore to hide envirenment variables  
the envireonment variables that need to be added for hosting  
PORT=3001  
MONGODB_URL=mongodb://127.0.0.1:27017/task-manager-api  
JWT_SECRET=secret_here  
EMAIL=email_here  
EMAIL_PASS=pass_here  
