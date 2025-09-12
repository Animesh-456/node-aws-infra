import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: "anim29006@gmail.com",
        pass: "xzsf ylkr hqoc tzzg"
    },
});

const sendmail = (to, subject, text) => {
    const mailOptions = {
        from: 'anim29006@gmail.com',
        to: to,
        subject: subject,
        html: text,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}
export default sendmail;

