const admin = require("firebase-admin")

// http://stackoverflow.com/questions/41287108/deploying-firebase-app-with-service-account-to-heroku-environment-variables-wit
const privateKey = process.env.NODE_ENV === 'production' 
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : process.env.FIREBASE_PRIVATE_KEY
const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL
})

const database = app.database()

module.exports = database
