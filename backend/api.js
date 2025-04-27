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



// Listen
app.listen(PORT, () => {
    console.log(`API is up and running on port ${PORT}`)
})