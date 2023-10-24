const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: "distinguishedsocietysales@gmail.com",
    pass: "ilmf agzt okig csjd",
  },
});

const  sendEmail = async (mailObj) => {
  try {
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailObj, (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      });
    });
  } catch (error) {
    console.log(error, "email not sent");
    return null;
  }
};

module.exports = {sendEmail}