const express = require('express')
const cors = require('cors')
const {v4:uuidv4} = require('uuid')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const sqlite3 = require('sqlite3').verbose()

const PORT = 1025
const app = express()
app.use(cors(
    {
        // "origin": [
        //     "http://localhost:5500",
        //     "http://127.0.0.1:5500", // These two localhost ones may not work. Add below entry to hostfile?
        //     "http://peermetric.com:5500",
        // ],
        "origin": function (origin, callback) {
            callback(null, true)
        },
        "allowedHeaders": [
            "Content-Type"
        ],
        "credentials": true
    }
))
app.use(express.json())
app.use(cookieParser())

// Make database object
const db = new sqlite3.Database('../peermetric-0.1.db')

// SESSION //

// Validate session
// with cookie SESSION_ID
// Returns 401 Unauthorized if the session doesn't exist
function validateSession(req, res, next){
    // Validate the cookie exists
    if(req.cookies.SESSION_ID == null) {
        res.status(401).json({})
        return
    } else {
        // Inquire of the database as to the truth value of the statement that one entry by the type of "Session" exists
        let strCommand = `SELECT * FROM tblSessions WHERE SessionID = ?`
        db.get(strCommand, [req.cookies.SESSION_ID], function(err, result) {
            if(err) {
                // Something went terribly wrong; use the checksum to see if a solar flare flipped some bits
                console.error(err)
                res.status(500).json({})
            } else if (result == null) {
                // We don't know about the session
                res.status(401).json({})
            } else if(result.ExpiryDate <= Date.now()) {
                // Oh no! The session is expired!
                res.clearCookie('SESSION_ID').status(401).json({})
            } else {
                // Who's a good session? You are!
                next()
            }
        })
    }
}

// Create session
// POST /session
// with body.email and body.password
// Returns 201 Created and cookie SESSION_ID if successful
// Returns 401 Unauthorized if unable to authenticate
// Returns 400 Bad REquest if the session already exists
app.post('/session', (req, res, next) => {
    // Make sure they don't already have a session cookie
    if(req.cookies.SESSION_ID != null) {
        res.status(400).json({})
        return
    }
    // Validate that the email and password are not empty
    if(req.body.email != null && req.body.password != null) {
        // Check the database for the credentials
        let strCommand = `SELECT * FROM tblUsers WHERE Email = ?`
        db.all(strCommand, [req.body.email], function(error, result){
            if(error) {
                console.error("DB error searching users: \n\t" + error)
                res.status(500).json({})
            } else{
                // Check each matching email to see if the password matches
                for(let i = 0; i < result.length; i++) {
                    if(bcrypt.compareSync(req.body.password, result[i].Password)) {
                        // Create the session
                        let strCommand = `INSERT INTO tblSessions (SessionID, UserID, ExpiryDate) VALUES (?, ?, ?)`
                        let strSessionId = uuidv4()
                        let unixtimeExpireTime = Date.now() + 12 * 60 * 60 * 1000 //12 hours
                        db.run(strCommand, [strSessionId, result[i].UserID, unixtimeExpireTime], function(error) {
                            if(error) {
                                console.error("DB error creating session: \n\t" + error)
                                res.status(500).json({})
                                return
                            }
                        })
                        res.cookie('SESSION_ID', strSessionId, {
                            httpOnly: true,
                            expires: unixtimeExpireTime, //12 hours
                            sameSite: 'Strict',
                            secure: false // Set to true with HTTPS
                        }).status(201).json({})
                        return
                    }
                }
                // No password matched :(
                res.status(401).json({})
            }
        })
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
    // Delete all sessions tied to the user
    let strCommand = `SELECT UserID FROM tblSessions WHERE SessionID = ?`
    db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
        if(error) {
            console.error("DB error searching sessions: \n\t" + error)
            res.status(500).json({})
        } else if (result == null) {
            // No session found
            res.status(401).json({})
        } else {
            // Delete all sessions tied to the user
            strCommand = `DELETE FROM tblSessions WHERE UserID = ?`
            db.run(strCommand, [result.UserID], function(error) {
                if(error) {
                    console.error("DB error deleting sessions: \n\t" + error)
                    res.status(500).json({})
                    return
                }
            })
            res.clearCookie('SESSION_ID')
            res.status(205).json({})
        }
    })
})

// USER //

// Create user
// POST /user
// with body.email body.password body.firstName body.lastName body.title body.phoneNumber body.otherContacts
// Returns 201 Created if successful
// Returns 400 Bad Request otherwise
app.post('/user', (req, res, next) => {
    // TODO add actual validation and user creation
    // (eg. Don't make account twice)

    // If there are valid fields, make account
    if(req.body.email && req.body.bio && req.body.password && req.body.firstName && req.body.lastName && req.body.middleInitial) {
        // Hash password to store in db
        const intSaltRounds = 10
        bcrypt.hash(req.body.password, intSaltRounds, (err, hash) => {
            if (err)
            {
                console.error(err.message)
                return res.status(500).json({
                    "message": err.message
                })
            }
            else
            {
                const strNewID = uuidv4()
                const strSqlQuery = "INSERT INTO tblUsers (UserID, Email, FirstName, LastName, MiddleInitial, Password, Bio) VALUES (?, ?, ?, ?, ?, ?, ?)"
                const arrParams = [strNewID, req.body.email, req.body.firstName, req.body.lastName, req.body.middleInitial, hash, req.body.bio]
                db.run(strSqlQuery, arrParams, (err) => {
                    if (err)
                    {
                        console.error(err.message)
                        return res.status(500).json({
                            message: err.message
                        })
                    }
                    else
                    {
                        return res.status(201).json({
                            "message": "User Created",
                            "userID": strNewID
                        })
                    }
                })
            }
        })
    } else {
        return res.status(400).json({"message": "Invalid Argument"})
    }
})

/*
    // All fields are required right now
    fetch('http://peermetric.com:1025/user', 
    {
        method: "POST",
        headers: {"Content-Type": "Application/JSON"},
        credentials: "include",
        body: JSON.stringify({
            "email": "jdoe@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "middleInitial": "R",
            "password": "Password123",
            "bio": "I am a user with the discord tag user#8573"
        })
    })
*/

// Update user
// PUT /user
// with body.email body.newPasswordHash body.firstName body.lastName body.title body.phoneNumber body.otherContacts
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.put('/user', validateSession, (req, res, next) => {
    // TODO add actual validation and user update
    if(req.body.email && req.body.newPassword && req.body.firstName && req.body.lastName && req.body.title && req.body.phoneNumber && req.body.otherContacts) {
        res.status(201).json({})
    } else {
        res.status(400).json({})
    }
})

// Read user
// GET /user
// with cookie SESSION_ID
// Returns 200 OK and user object if successful
// Returns 401 Unauthorized if the session doesn't exist... see validateSession()
// User object:
// {
//   userId: string,
//   email: string,
//   firstName: string,
//   lastName: string,
//   middleInitial: string
//   bio: string
// }
app.get('/user', validateSession, (req, res, next) => {
    strSessionID = req.cookies.SESSION_ID
    
    strSqlQuery = "SELECT * FROM tblUsers LEFT JOIN tblSessions ON tblUsers.UserID = tblSessions.UserID WHERE tblSessions.SessionID = ?;"
    strSqlParam = strSessionID

    db.get(strSqlQuery, strSqlParam, (error, result) => {
        if (error)
        {
            console.error(error.message)
            return res.status(400).json({
                message: error.message
            })
        }
        else
        {
            return res.status(200).json({
                userID: result.UserID,
                Email: result.Email,
                firstName: result.FirstName,
                lastName: result.LastName,
                middleInitial: result.MiddleInitial,
                bio: result.Bio
            })
        }
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
//   middleInitial: string
//   bio: string
// }
app.get('/user/byUuid/:userId', validateSession, (req, res, next) => {
    // TODO validate userId and get user
    // res.status(200).json({
    //     userId: "userId",
    //     email: "abc@aol.com",
    //     firstName: "Jill",
    //     lastName: "Doe",
    //     title: "Ms.",
    //     phoneNumber: "123-456-0987",
    //     otherContacts: "discord: JillDoe#1234"
    // })
    return res.status(501).json({
        message: "Not yet built. Let me know when you need this!"
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
//   middleInitial: string
//   bio: string
// }
app.get('/user/byEmail/:email', validateSession, (req, res, next) => {

    strSqlQuery = "SELECT * FROM tblUsers WHERE Email = ?;"
    strSqlParam = req.params.email
    db.get(strSqlQuery, strSqlParam, (error, result) => {
        if (error)
        {
            console.error(error.message)
            return res.status(400).json({
                message: error.message
            })
        }
        else
        {
            if (!result)
            {
                return res.status(400).json({
                    message: `User ${req.params.email} not found`
                })
            }
            else
            {
                return res.status(200).json({
                    userID: result.UserID,
                    Email: result.Email,
                    firstName: result.FirstName,
                    lastName: result.LastName,
                    middleInitial: result.MiddleInitial,
                    bio: result.Bio
                })
            }
        }
    })
})

// Delete current user
// DELETE /user
// with body.password
// with cookie SESSION_ID
// Returns 201 Created if successfully deleted
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise

// AS OF NOW, THIS ROUTE BREAKS SQL THEORY!!
app.delete('/user', validateSession, (req, res, next) => {

    strSessionID = req.cookies.SESSION_ID
    // I honestly didn't think this query would even work lol
    strSqlQuery = "DELETE FROM tblUsers WHERE tblUsers.UserID = (SELECT tblUsers.UserID from tblUsers LEFT JOIN tblSessions ON tblUsers.UserID = tblSessions.UserID WHERE tblSessions.SessionID = ?);"
    strSqlParam = strSessionID

    db.run(strSqlQuery, strSqlParam, (error) => {
        if (error)
        {
            console.error(error.message)
            return res.status(400).json({
                message: error.message
            })
        }
        else
        {
            // Delete sessionID 
            res.clearCookie('SESSION_ID')
            return res.status(205).json({
                message: "User deleted!"
            })
        }
    })
})

app.delete('/user/byEmail/', validateSession, (req, res, next) => {
    strSqlQuery = "DELETE FROM tblUsers WHERE tblUsers.Email = ?;"
    strSqlParam = req.params.email

    db.run(strSqlQuery, strSqlParam, (error) => {
        if (error)
        {
            console.error(error.message)
            return res.status(400).json({
                message: error.message
            })
        }
        else
        {
            res.clearCookie('SESSION_ID')
            return res.status(205).json({
                message: "User deleted!"
            })
        }
    })
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