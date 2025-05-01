const express = require('express')
const cors = require('cors')
const {v4:uuidv4} = require('uuid')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')

const PORT = 1025
const app = express()
app.use(cors())
app.use(express.json())
app.use(cookieParser())


// SESSION //

// Validate session
// with cookie SESSION_ID
// Returns 401 Unauthorized if the session doesn't exist
function validateSession(req, res, next){
    // TODO add actual validation
    if(sessionID == null) {
        res.status(401).json({})
        return
    } else {
        next()
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
        res.status(201).json({})
    } else {
        res.status(401).json({})
    }
})

// Delete session
// DELETE /session
// with cookie SESSION_ID
// Return 205 Reset Content if the user's sessions are successfully revoked
// Return 401 Unauthorized otherwise
app.delete('/session', validateSession, (req, res, next) => {
    res.clearCookie('SESSION_ID')
    // TODO revoke session in sqlite db
    res.status(205).json({})
})

// USER //

// Create user
// POST /user
// with body.email body.passwordHash body.firstName body.lastName body.title body.phoneNumber body.otherContacts
// Returns 201 Created if successful
// Returns 400 Bad Request otherwise
app.post('/user', (req, res, next) => {
    // TODO add actual validation and user creation
    if(req.body.email && req.body.passwordHash && req.body.firstName && req.body.lastName && req.body.title && req.body.phoneNumber && req.body.otherContacts) {
        res.status(201).json({})
    } else {
        res.status(400).json({})
    }
})

// Update user
// PUT /user
// with body.email body.newPasswordHash body.firstName body.lastName body.title body.phoneNumber body.otherContacts
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.put('/user', validateSession, (req, res, next) => {
    // TODO add actual validation and user update
    if(req.body.email && req.body.newPasswordHash && req.body.firstName && req.body.lastName && req.body.title && req.body.phoneNumber && req.body.otherContacts) {
        res.status(201).json({})
    } else {
        res.status(400).json({})
    }
})

// Read user
// GET /user
// with cookie SESSION_ID
// Returns 200 OK and user object if successful
// Returns 401 Unauthorized if the session doesn't exist
// User object:
// {
//   userId: string,
//   email: string,
//   firstName: string,
//   lastName: string,
//   title: string,
//   phoneNumber: string,
//   otherContacts: string
// }
app.get('/user', validateSession, (req, res, next) => {
    // TODO get user from session
    res.status(200).json({
        userId: "userId",
        email: "lol@aol.com",
        firstName: "John",
        lastName: "Doe",
        title: "Mr.",
        phoneNumber: "123-456-7890",
        otherContacts: "discord: JohnDoe#1234"
    })
})

// Read user
// GET /user/byUuid/{userId}
// with cookie SESSION_ID
// Returns 200 OK and user object if successful
// Returns 401 Unauthorized if the session doesn't exist
// User object:
// {
//   userId: string,
//   email: string,
//   firstName: string,
//   lastName: string,
//   title: string,
//   phoneNumber: string,
//   otherContacts: string
// }
app.get('/user/byUuid/:userId', validateSession, (req, res, next) => {
    // TODO validate userId and get user
    res.status(200).json({
        userId: "userId",
        email: "abc@aol.com",
        firstName: "Jill",
        lastName: "Doe",
        title: "Ms.",
        phoneNumber: "123-456-0987",
        otherContacts: "discord: JillDoe#1234"
    })
})

// Read user
// GET /user/byEmail/{email}
// with cookie SESSION_ID
// Returns 200 OK and user object if successful
// Returns 401 Unauthorized if the session doesn't exist
// User object:
// {
//   userId: string,
//   email: string,
//   firstName: string,
//   lastName: string,
//   title: string,
//   phoneNumber: string,
//   otherContacts: string
// }
app.get('/user/byEmail/:email', validateSession, (req, res, next) => {
    // TODO validate email and get user
    res.status(200).json({
        userId: "userId",
        email: "abc@aol.com",
        firstName: "Jill",
        lastName: "Doe",
        title: "Ms.",
        phoneNumber: "123-456-0987",
        otherContacts: "discord: JillDoe#1234"
    })
})

// Delete user
// DELETE /user
// with body.password
// with cookie SESSION_ID
// Returns 201 Created if successfully deleted
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.delete('/user', validateSession, (req, res, next) => {
    // TODO add actual validation and delete user
    if(req.body.password) {
        res.status(201).json({})
    } else {
        res.status(400).json({})
    }
})

// COURSE //

// Create course
// POST /course
// with body.courseCode(e.g. CSC 3100-001), body.friendlyName(e.g. Web Dev)
// with cookie SESSION_ID
// Returns 201 Created with courseId if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.post('/course', validateSession, (req, res, next) => {
    // TODO add actual validation and course creation
    if(req.body.courseCode && req.body.friendlyName) {
        res.status(201).json({courseId: "courseId"})
    } else {
        res.status(400).json({})
    }
})

// Update course
// PUT /course/{courseId}
// with body.courseCode(e.g. CSC 3100-001), body.friendlyName(e.g. Web Dev), body.groupList, body.studentList
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.put('/course/:courseId', validateSession, (req, res, next) => {
    // TODO add permission validation, actual validation, and course update
    if(req.params.courseId && req.body.courseCode && req.body.friendlyName && req.body.groupList && req.body.studentList) {
        res.status(201).json({})
    } else {
        res.status(400).json({})
    }
})

// Read course
// GET /course/{courseId}
// with cookie SESSION_ID
// Returns 200 OK and course object if successful
// Returns 401 Unauthorized if the session doesn't exist
// Course object:
// {
//   ownerId: string,
//   courseCode: string,
//   friendlyName: string,
//   groupList: [
//     "groupId0",
//     "groupId1"
//   ],
//   studentList: [
//     "studentId0",
//     "studentId1"
//   ]
// }
app.get('/course/:courseId', validateSession, (req, res, next) => {
    // TODO add validation and get course
    if(req.params.courseId) {
        // TODO validate courseId and get course
        res.status(200).json({
            ownerId: "ownerId",
            courseCode: "CSC 3100-001",
            friendlyName: "Web Dev",
            groupList: [
                "groupId0",
                "groupId1"
            ],
            studentList: [
                "studentId0",
                "studentId1"
            ]
        })
    } else {
        res.status(400).json({})
    }
})

// Delete course
// DELETE /course/{courseId}
// with cookie SESSION_ID
// Returns 201 Created if successfully deleted
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.delete('/course/:courseId', validateSession, (req, res, next) => {
    // TODO add permission validation, actual validation, and delete course
    if(req.params.courseId) {
        res.status(201).json({})
    } else {
        res.status(400).json({})
    }
})

// Add student to course
// POST /course/{courseId}/student/{studentId}
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.post('/course/:courseId/student/:studentId', validateSession, (req, res, next) => {
    // TODO add permission validation, actual validation, and add student to course
    if(req.params.courseId && req.params.studentId) {
        res.status(201).json({})
    } else {
        res.status(400).json({})
    }
})

// Remove student from course
// DELETE /course/{courseId}/student/{studentId}
// with cookie SESSION_ID
// Returns 201 Created if successfully removed
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.delete('/course/:courseId/student/:studentId', validateSession, (req, res, next) => {
    // TODO add permission validation, actual validation, and remove student from course
    if(req.params.courseId && req.params.studentId) {
        res.status(201).json({})
    } else {
        res.status(400).json({})
    }
})

// GROUP //

// Add a group to the course
// POST /course/{courseId}/group
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.post('/course/:courseId/group', validateSession, (req, res, next) => {
    // TODO add actual validation and group creation
    res.status(201).json({groupId: "groupId"})
})

// Update group
// PUT /group/{groupId}
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.put('/group/:groupId', validateSession, (req, res, next) => {
    // TODO add actual validation and group update
    if(req.params.groupId) {
        res.status(201).json({})
    } else {
        res.status(400).json({})
    }
})

// Read group
// GET /group/{groupId}
// with cookie SESSION_ID
// Returns 200 OK and group object if successful
// Returns 401 Unauthorized if the session doesn't exist
// Group object:
// {
//   groupId: string,
//   groupName: string,
//   groupMembers: [
//     "studentId0",
//     "studentId1"
//   ]
// }
app.get('/group/:groupId', validateSession, (req, res, next) => {
    // TODO add actual validation and group read
    if(req.params.groupId) {
        res.status(200).json({
            groupId: "groupId",
            groupName: "Group 1",
            groupMembers: [
                "studentId0",
                "studentId1"
            ]
        })
    } else {
        res.status(400).json({})
    }
})

// Delete group
// DELETE /group/{groupId}
// with cookie SESSION_ID
// Returns 201 Created if successfully deleted
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.delete('/group/:groupId', validateSession, (req, res, next) => {
    // TODO add actual validation and group delete
    if(req.params.groupId) {
        res.status(201).json({})
    } else {
        res.status(400).json({})
    }
})

// Add student to group
// POST /group/{groupId}/student/{studentId}
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.post('/group/:groupId/student/:studentId', validateSession, (req, res, next) => {
    // TODO add actual validation and add student to group
    if(req.params.groupId && req.params.studentId) {
        res.status(201).json({})
    } else {
        res.status(400).json({})
    }
})

// Remove student from group
// DELETE /group/{groupId}/student/{studentId}
// with cookie SESSION_ID
// Returns 201 Created if successfully removed
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.delete('/group/:groupId/student/:studentId', validateSession, (req, res, next) => {
    // TODO add actual validation and remove student from group
    if(req.params.groupId && req.params.studentId) {
        res.status(201).json({})
    } else {
        res.status(400).json({})
    }
})

// REVIEW SPEC //

// Create review spec
// POST /course/{courseId}/reviewSpec
// with body.liveDate body.expiryDate
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.post('/course/:courseId/reviewSpec', validateSession, (req, res, next) => {
    // TODO add actual validation and review spec creation
    if(req.params.courseId && req.body.liveDate && req.body.expiryDate) {
        res.status(201).json({reviewSpecId: "reviewSpecId"})
    } else {
        res.status(400).json({})
    }
})

// Update review spec
// PUT /reviewSpec/{reviewSpecId}
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.put('/reviewSpec/:reviewSpecId', validateSession, (req, res, next) => {
    // TODO add actual validation and review spec update
    if(req.params.reviewSpecId) {
        res.status(201).json({})
    } else {
        res.status(400).json({})
    }
})

// Read review spec
// GET /reviewSpec/{reviewSpecId}
// with cookie SESSION_ID
// Returns 200 OK and review spec object if successful
// Returns 401 Unauthorized if the session doesn't exist
// Review spec object:
// {
//   reviewSpecId: string,
//   courseId: string,
//   liveDate: string,
//   expiryDate: string,
// }
app.get('/reviewSpec/:reviewSpecId', validateSession, (req, res, next) => {
    // TODO add actual validation and review spec read
    if(req.params.reviewSpecId) {
        res.status(200).json({
            reviewSpecId: "reviewSpecId",
            courseId: "courseId",
            liveDate: "UnixTimestamp",
            expiryDate: "UnixTimestamp"
        })
    } else {
        res.status(400).json({})
    }
})

// Delete review spec
// DELETE /reviewSpec/{reviewSpecId}
// with cookie SESSION_ID
// Returns 201 Created if successfully deleted
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.delete('/reviewSpec/:reviewSpecId', validateSession, (req, res, next) => {
    // TODO add actual validation and review spec delete
    if(req.params.reviewSpecId) {
        res.status(201).json({})
    } else {
        res.status(400).json({})
    }
})

// RESPONSE //

// Create response
// POST /group/{groupId}/response/
// with body.reviewSpecId body.reviewerId body.targetId body.publicFeedback body.privateFeedback
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.post('/group/:groupId/response', validateSession, (req, res, next) => {
    // TODO add actual validation and response creation
    if(req.params.groupId && req.body.reviewSpecId && req.body.reviewerId && req.body.targetId && req.body.publicFeedback && req.body.privateFeedback) {
        res.status(201).json({responseId: "responseId"})
    } else {
        res.status(400).json({})
    }
})

// Get public response
// GET /response/{responseId}
// with cookie SESSION_ID
// Returns 200 OK and response object if successful
// Returns 401 Unauthorized if the session doesn't exist
// Response object:
// {
//   responseId: string,
//   reviewSpecId: string,
//   reviewerId: string,
//   targetId: string,
//   publicFeedback: string,
// }
app.get('/response/:responseId', validateSession, (req, res, next) => {
    // TODO add actual validation and response read
    if(req.params.responseId) {
        res.status(200).json({
            responseId: "responseId",
            reviewSpecId: "reviewSpecId",
            reviewerId: "reviewerId",
            targetId: "targetId",
            publicFeedback: "publicFeedback"
        })
    } else {
        res.status(400).json({})
    }
})

// Get private response
// GET /response/{responseId}/private
// with cookie SESSION_ID
// Returns 200 OK and response object if successful
// Returns 401 Unauthorized if the session doesn't exist
// Response object:
// {
//   responseId: string,
//   reviewSpecId: string,
//   reviewerId: string,
//   targetId: string,
//   publicFeedback: string,
//   privateFeedback: string,
// }
app.get('/response/:responseId/private', validateSession, (req, res, next) => {
    // TODO add actual validation and response read
    if(req.params.responseId) {
        res.status(200).json({
            responseId: "responseId",
            reviewSpecId: "reviewSpecId",
            reviewerId: "reviewerId",
            targetId: "targetId",
            publicFeedback: "publicFeedback",
            privateFeedback: "privateFeedback"
        })
    } else {
        res.status(400).json({})
    }
})

// Delete response
// DELETE /response/{responseId}
// with cookie SESSION_ID
// Returns 201 Created if successfully deleted
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.delete('/response/:responseId', validateSession, (req, res, next) => {
    // TODO add actual validation and response delete
    if(req.params.responseId) {
        res.status(201).json({})
    } else {
        res.status(400).json({})
    }
})

app.get('/coffee', (req, res, next) => {
    res.status(418).json({})
})

// Listen
app.listen(PORT, () => {
    console.log(`API is up and running on port ${PORT}`)
})