const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail');
const busboy = require('busboy');

sgMail.setApiKey(functions.config().sendgrid.key);

// Cloud Function to send email with SendGrid
exports.sendEmail = functions.https.onRequest((req, res) => {
  const bb = busboy({ headers: req.headers });
  let email; // Changed to let
  let message; // Changed to let
  let dateTime; // Changed to let

  // Capture email, message, and dateTime fields
  bb.on('field', (fieldname, val) => {
    if (fieldname === 'email') email = val; // Capture the email field
    if (fieldname === 'message') message = val; 
    if (fieldname === 'dateTime') dateTime = new Date(val); 
  });

 
    // Log the captured values for debugging
    console.log('Email:', email);
    console.log('Message:', message);
    console.log('DateTime:', dateTime);

    // Check if email is defined
    

    const now = new Date();

    // If the scheduled time is in the future, delay sending
    if (dateTime > now) {
      const delay = dateTime - now; // Time in milliseconds
      setTimeout(() => {
        sendEmail(email, message, res);
      }, delay);
      res.status(200).send(`Email will be sent in ${Math.ceil(delay / 1000)} seconds.`);
    } else {
      sendEmail(email, message, res);
    }
    req.pipe(bb);
  });

  


// Function to send email using SendGrid
const sendEmail = (email, message, res) => {
  const msg = {
    to: "anushikakashyap2@gmail.com",
    from: 'ishitagupta224@gmail.com', // Replace with your verified SendGrid sender
    subject: 'Reminder',
    text: message,
    html: `<p>${message}</p>`,
  };

  sgMail
    .send(msg)
    .then(() => {
      res.status(200).send('Email sent successfully.');
    })
    .catch((error) => {
      console.error('Error sending email:', error);
      res.status(500).send('Failed to send email: ' + error.message);
    });
};
