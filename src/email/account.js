const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
})



function sendWelcomeMail(email, name) {

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Welcome,',
        text: `Hello ${name}`,
        html: `<h3 aling="center">Skin Cancer Platform<h3><p><strong>hello ${name}</strong></p>`
    }
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });


}

function sendRandomCode(email,code) {

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Code',
        text: code
    }
    
    return transporter.sendMail(mailOptions);


}

module.exports = {
    sendWelcomeMail,
    sendRandomCode
}