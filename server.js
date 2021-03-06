/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable no-return-await */
/* eslint-disable no-param-reassign */
/* eslint-disable padded-blocks */
import express, { json } from 'express'
import morgan from 'morgan'
import 'colors'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import mongoSanitize from 'express-mongo-sanitize'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import hpp from 'hpp'
import cors from 'cors'
import passport from 'passport'
import session from 'express-session'
import './config/env.js' // FIRST !
import { GoogleStrategy, GithubStrategy } from './utils/passportStrategies.js'
import errorHandlrer from './middleware/error.js'
import programs from './routes/programs.js'
import topics from './routes/topics.js'
import dictionary from './routes/dictionary.js'
import auth from './routes/auth.js'
import users from './routes/users.js'
import connectDB from './config/db.js'
import types from './routes/types.js'
import User from './models/User.js'

// const xss = require('xss-clean')

const __dirname = dirname(fileURLToPath(import.meta.url))
global.MadinahBackRootPath = path.resolve(__dirname)

connectDB()

const app = express()

const sessionParams = {
  secret: 'secretcode',
  resave: true,
  saveUninitialized: true,
}

if (process.env.NODE_ENV === 'production') {
  sessionParams.cookie = {
    sameSite: true,
    // secure: true, // @FIXME check this I dont know
    maxAge: 1000 * 60 * 60 * 24 * 7, // One Week
  }
}

app.use(session(sessionParams))

// Passport

passport.serializeUser((user, done) => done(null, user._id)) // console.log('serialise'.blue, user)
passport.deserializeUser((id, done) => {
  console.log('passport.deserializeUser'.bgCyan.black, id)
  return User.findById(id, (err, user) => {
    if (err) { return done(err) }
    done(null, user)
  })
})

passport.use(GoogleStrategy())
passport.use(GithubStrategy())

app.use(passport.initialize())
app.use(passport.session())
/*
- _
-
-
-
-
-
--

*/

// Enable CORS
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: process.env.DOMAIN_CLIENT, credentials: true }))
}

// Body parser
app.use(json({ limit: '50mb' })) // 50mb this for image data:blop

// Dev logging middleware if(process.env.NODE_ENV === 'development') {// }
app.use(morgan('dev'))

// Sanitize data
app.use(mongoSanitize())

// Set security headers
app.use(helmet())

// Prevent XSS attaks // если я это включу то мои topics будут сохраняться кракозябрами вместo > - &lp
// app.use(xss())

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200,
})
app.use(limiter)

// Prevent http param pillution
app.use(hpp())

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Mount routers
app.use('/api/v1/topics', topics)
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)
app.use('/api/v1/programs', programs)
app.use('/api/v1/types', types)
app.use('/api/v1/dictionary', dictionary)

app.use(errorHandlrer)
app.use('*', (req, res) => { res.status(404).json({ success: false, error: 'The requested URL does not exist' }) }) // https://stackoverflow.com/questions/6528876/how-to-redirect-404-errors-to-a-page-in-expressjs

const PORT = process.env.PORT || 5000
const server = app.listen(
  PORT,
  console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`.blue),
)

// Handle unhandle promise rejecttion
process.on('unhandledRejection', (err) => {
  console.log(`Error Ya Ahki:  ${err.message}`.red)
  server.close(() => process.exit(1)) // Close server & exit procces
})

