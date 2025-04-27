const express = require('express')
const cors = require('cors')
const {v4:uuidv4} = require('uuid')
const bcrypt = require('bcrypt')


const PORT = 1025
const app = express()
app.use(cors())
app.use(express.json())

// SESSION //

// Validate session
function validateSession(sessionID){
    // TODO add actual validation
    if(sessionID == null) {
        return false
    } else {
        return true
    }
}

// Create session
// POST /session
// with body.email and body.password
// Returns 201 Created and cookie SESSION_ID if successful
// Returns 401 Unauthorized otherwise
app.post('/session', (req, res, next) => {
    // TODO add actual authentication
    if(req.body.email != null && req.body.password != null) {
        const sessionId = uuidv4()
        res.cookie('SESSION_ID', sessionId, {
            httpOnly: true,
            maxAge: 12 * 60 * 60 * 1000, //12 hours
            sameSite: 'Strict',
            secure: false // Set to true with HTTPS
        })
        res.status(201)
    } else {
        res.status(401)
    }
})

// Delete session
// DELETE /session
// with cookie SESSION_ID
// Return 205 Reset Content if the user's sessions are successfully revoked
// Return 401 Unauthorized otherwise
app.delete('/session', (req, res, next) => {
    const sessionID = req.cookies.SESSION_ID
    if(validateSession(sessionID)) {
        res.clearCookie('SESSION_ID')
        // TODO revoke session in sqlite db
        res.status(205)
    } else {
        res.status(401)
    }
})

// USER //

// Create user
// POST /user
// with body.email body.passwordHash body.firstName body.lastName body.title body.contactInfo
// Returns 201 Created if successful
// Returns 400 Bad Request otherwise
app.post('/user', (req, res, next) => {
    // TODO add actual validation and user creation
    if(req.body.email && req.body.passwordHash && req.body.firstName && req.body.lastName && req.body.title && req.body.contactInfo) {
        res.status(201)
    } else {
        res.status(400)
    }
})

// Update user
// PUT /user
// with body.email body.newPasswordHash body.firstName body.lastName body.title body.contactInfo
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.put('/user', (req, res, next) => {
    const sessionID = req.cookies.SESSION_ID
    if(validateSession(sessionID)) {
        // TODO add actual validation and user update
        if(req.body.email && req.body.newPasswordHash && req.body.firstName && req.body.lastName && req.body.title && req.body.contactInfo) {
            res.status(201)
        } else {
            res.status(400)
        }
    } else {
        res.status(401)
    }
})

// Get user
// GET /user
// with cookie SESSION_ID
// Returns 200 OK and user object if successful
// Returns 401 Unauthorized if the session doesn't exist
// User object:
// {
//   email: string,
//   firstName: string,
//   lastName: string,
//   title: string,
//   contactInfo: string
// }
app.get('/user', (req, res, next) => {
    if(req.cookies.SESSION_ID) {
        res.status(200).json({
            email: "lol@aol.com",
            firstName: "John",
            lastName: "Doe",
            title: "Mr.",
            contactInfo: "123-456-7890"
        })
    } else {
        res.status(401)
    }
})

// Delete user
// DELETE /user
// with body.password
// with cookie SESSION_ID
// Returns 201 Created if successfully deleted
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.delete('/user', (req, res, next) => {
    const sessionID = req.cookies.SESSION_ID
    if(validateSession(sessionID)) {
        // TODO add actual validation and delete user
        if(req.body.password) {
            res.status(201)
        } else {
            res.status(400)
        }
    } else {
        res.status(401)
    }
})

// Listen
app.listen(PORT, () => {
    console.log(`API is up and running on port ${PORT}`)
})