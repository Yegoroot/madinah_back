import fs from 'fs'
import mongoose from 'mongoose'
import 'colors'
import { dirname } from 'path'
import './config/env.js' // FIRST !
import { fileURLToPath } from 'url'
import Users from './models/User.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Connect to db
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
})

// Read JSON files
// const topics = JSON.parse(fs.readFileSync(`${__dirname}/_data/topics.json`, 'utf-8'))
// const notes = JSON.parse(fs.readFileSync(`${__dirname}/_data/notes.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'))

// Import into DB
const importData = async () => {
  try {
    // await Topic.create(topics)
    // await Note.create(notes)
    await Users.create(users)

    // eslint-disable-next-line no-console
    console.log('data imported...'.green.inverse)
    process.exit()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Err БРО', err)
  }
}

// Delete data
const deleteData = async () => {
  try {
    // await Topic.deleteMany()
    // await Note.deleteMany()
    await Users.deleteMany()

    // eslint-disable-next-line no-console
    console.log('data destroyed...'.red.inverse)
    process.exit()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
  }
}

/**
 * import data to db "node sender.js -i"
 * delete data in db "node sender.js -d"
 */
if (process.argv[2] === '-i') {
  importData()
} else if (process.argv[2] === '-d') {
  deleteData()
}
