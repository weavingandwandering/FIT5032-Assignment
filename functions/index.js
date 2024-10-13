const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");
const firebaseAdmin = require("firebase-admin");
const cors = require("cors");
const axios = require("axios");

firebaseAdmin.initializeApp();
const corsMiddleware = cors({origin: true});
sgMail.setApiKey(functions.config().sendgrid.key);

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
              content: file.content,
              filename: file.filename,
              type: file.type,
              disposition: "attachment",
            })),
          };

          try {
            await sgMail.send(msg);
            console.log(`Email sent to ${email}`);
            await doc.ref.delete();
          } catch (error) {
            console.error("Error sending email:", error);
          }
        });

        await Promise.all(emailPromises);
        res.status(200).send("Scheduled emails processed successfully!");
      });
    });


exports.chatbotAPI = functions
    .region("australia-southeast1")
    .https.onRequest((req, res) => {
      corsMiddleware(req, res, async () => {
        try {
          const userMessage = req.body.message;
          const standard = "Give the entire reponse in one line";

          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${functions.config().gemini.key}`;

          const requestData = {
            contents: [
              {
                parts: [
                  {
                    text: userMessage + standard,
                  },
                ],
              },
            ],
          };

          const response = await axios.post(apiUrl, requestData, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          const botReply = extractBotReply(response.data);
          return res.status(200).send({reply: botReply});
        } catch (error) {
          return res.status(500).send("Error processing the request.");
        }
      });

      const extractBotReply = (data) => {
        if (data && data.candidates && data.candidates.length > 0) {
          return data.candidates;
        }
        return "Sorry, I could not understand your request.";
      };
    });

const stripe = require("stripe")(functions.config().stripe.key);

exports.processDonation = functions
    .region("australia-southeast1")
    .https.onRequest((req, res) => {
      corsMiddleware(req, res, async () => {
        if (req.method !== "POST") {
          return res.status(405).send("Method Not Allowed");
        }

        const {amount} = req.body;
        const currency = "aud";
        const source = "tok_visa";
        const description = "Donation";
        if (!amount || !currency || !source) {
          return res.status(400).send("Invalid request parameters");
        }

        try {
          const charge = await stripe.charges.create({
            amount,
            currency,
            source,
            description,
          });

          return res.status(200).json({success: true, charge});
        } catch (error) {
          console.error("Stripe charge failed:", error);
          return res.status(500).json({success: false, error: error.message});
        }
      });
    });

sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendBulkEmail = functions
    .region("australia-southeast1")
    .https.onRequest((req, res) => {
      corsMiddleware(req, res, async () => {
        const {eventId, emails} = req.body;

        // Validate input
        if (!eventId || !Array.isArray(emails) || emails.length === 0) {
          return res.status(400).send("Invalid eventId or emails");
        }

        try {
          console.log("Fetching event with ID:", eventId);
          const eventSnapshot = await firebaseAdmin.firestore()
              .collection("events").doc(eventId).get();

          if (!eventSnapshot.exists) {
            return res.status(404).send("Event not found");
          }

          const event = eventSnapshot.data();
          const recipientEmails = emails;

          const msg = {
            to: recipientEmails,
            from: "ishitagupta224@gmail.com",
            subject: `Reminder: ${event.name}`,
            text: `Reminder for upcoming event: ${event.name} on ${event.date}`,
            html: `<strong>This is a reminder for upcoming event:</strong><br>
               <strong>Name:</strong> ${event.name}<br>
               <strong>Date:</strong> ${event.eventDate}<br>
               <strong>Description:</strong> ${event.description}<br>
               <strong>Location:</strong> ${event.location}<br>`,
          };

          await sgMail.sendMultiple(msg);
          res.status(200).send("Emails sent");
        } catch (error) {
          console.error("Error sending email:", error.message);
          res.status(500).send("Error sending email");
        }
      });
    });
