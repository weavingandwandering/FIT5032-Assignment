const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail');
const cors = require('cors')({ origin: true });

sgMail.setApiKey('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'); 

exports.sendEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { email, message } = req.body;

    const msg = {
      to: email,
      from: 'ishitagupta224@gmail.com',  // Your verified SendGrid sender email
      subject: 'Reminder',
      text: message,
    };

    try {
      await sgMail.send(msg);
      res.status(200).send('Email sent successfully!');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error sending email');
    }
  });
});
