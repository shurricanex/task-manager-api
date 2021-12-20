const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const sendEmail = (email,name) => {
    sgMail.send({
        from:'sarakkornsakol@gmail.com',
        to: email,
        subject: 'Welcome to Task App',
        text: `glad that joined with us! ${name}, Welcome !!`,
    
    })
}
const sendFarewellEmail = (email,name) => {
    sgMail.send({
        from:'sarakkornsakol@gmail.com',
        to: email,
        subject: 'Farewell',
        text: `So sad that you leave us! ${name}, good bye !!`,
    
    })
}
module.exports = {
    sendEmail,
    sendFarewellEmail
}