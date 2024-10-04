const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");
const firebaseAdmin = require("firebase-admin");
const cors = require("cors");

firebaseAdmin.initializeApp();
const corsMiddleware = cors({origin: true});
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.scheduleEmail = functions
    .region("australia-southeast1")
    .https.onRequest((req, res) => {
      corsMiddleware(req, res, async () => {
        if (req.method !== "POST") {
          return res.status(405).send("Method Not Allowed");
        }

        const {email, message, sendAt, attachments} = req.body;

        const dater = new Date(sendAt);
        if (isNaN(dater.getTime())) {
          return res.status(400).send("Invalid date format for sendAt");
        }
        const sendT=firebaseAdmin.firestore.Timestamp.fromDate(new Date(dater));

        // Prepare the email object to store in Firestore
        const sEmail = {
          email,
          message,
          sendAt: sendT,
          attachments: attachments || [], // Store the attachments if they exist
        };

        try {
          await firebaseAdmin.firestore()
              .collection("scheduledEmails")
              .add(sEmail);
          res.status(200).send("Email scheduled successfully!");
        } catch (error) {
          console.error("Error scheduling email:", error);
          res.status(500).send("Error scheduling email");
        }
      });
    });

exports.sendEmailsHttp = functions
    .region("australia-southeast1")
    .https.onRequest((req, res) => {
      corsMiddleware(req, res, async () => {
        const now = firebaseAdmin.firestore.Timestamp.now();
        console.log("HERE");

        const snapshot = await firebaseAdmin.firestore()
            .collection("scheduledEmails")
            .where("sendAt", "<=", now)
            .get();

        console.log(`Found ${snapshot.size} emails to process`);

        if (snapshot.empty) {
          return res.status(200).send("No emails to send.");
        }

        const emailPromises = snapshot.docs.map(async (doc) => {
          const {email, message, attachments} = doc.data();
          console.log(`Preparing to send email`);

          const msg = {
            to: email,
            from: "ishitagupta224@gmail.com",
            subject: "Scheduled Reminder",
            text: message,
            attachments: attachments.map((file) => ({
              content: file.content, // Base64 content of the file
              filename: file.filename, // Name of the file
              type: file.type, // MIME type of the file
              disposition: "attachment",
            })),
          };

          try {
            await sgMail.send(msg);
            console.log(`Email sent to ${email}`);
            await doc.ref.delete(); // Deletes the email document after sending
          } catch (error) {
            console.error("Error sending email:", error);
          }
        });

        await Promise.all(emailPromises);
        res.status(200).send("Scheduled emails processed successfully!");
      });
    });
