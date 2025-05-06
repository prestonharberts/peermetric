const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const sqlite3 = require('sqlite3').verbose()

const PORT = 1025
const regexUUID = /[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-4[0-9A-Za-z]{3}-[89ABab][0-9A-Za-z]{3}-[0-9A-Za-z]{12}/
const intTimeout = 50; // milliseconds — used for artificial async delays after DB calls

const app = express()
app.use(cors(
  {
    // "origin": [
    //     "http://localhost:5500",
    //     "http://127.0.0.1:5500", // These two localhost ones may not work. Add below entry to hostfile?
    //     "http://peermetric.com:5500",
    // ],
    "origin": function(origin, callback) {
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
function validateSession(req, res, next) {
  // Validate the cookie exists
  if (req.cookies.SESSION_ID == null) {
    res.status(401).json({})
    return
  } else {
    // Inquire of the database as to the truth value of the statement that one entry by the type of "Session" exists
    let strCommand = `SELECT * FROM tblSessions WHERE SessionID = ?`
    db.get(strCommand, [req.cookies.SESSION_ID], function(err, result) {
      if (err) {
        // Something went terribly wrong; use the checksum to see if a solar flare flipped some bits
        console.error(err)
        res.status(500).json({})
      } else if (result == null) {
        // We don't know about the session
        res.status(401).json({})
      } else if (result.ExpiryDate <= Date.now()) {
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
  if (req.cookies.SESSION_ID != null) {
    res.clearCookie('SESSION_ID')
  }
  // Validate that the email and password are not empty
  if (req.body.email != null && req.body.password != null) {
    // Check the database for the credentials
    let strCommand = `SELECT * FROM tblUsers WHERE Email = ?`
    db.all(strCommand, [req.body.email], async function(error, result) {
      if (error) {
        console.error("DB error searching users: \n\t" + error)
        res.status(500).json({})
      } else {
        // Check each matching email to see if the password matches
        for (let i = 0; i < result.length; i++) {
          if (bcrypt.compareSync(req.body.password, result[i].Password)) {
            // Create the session
            let strCommand = `INSERT INTO tblSessions (SessionID, UserID, ExpiryDate) VALUES (?, ?, ?)`
            let strSessionId = uuidv4()
            let unixtimeExpireTime = Date.now() + 12 * 60 * 60 * 1000 //12 hours
            await db.run(strCommand, [strSessionId, result[i].UserID, unixtimeExpireTime], function(error) {
              if (error) {
                console.error("DB error creating session: \n\t" + error)
                res.status(500).json({})
                return
              }
            })
            res.cookie('SESSION_ID', strSessionId, {
              httpOnly: true,
              expires: new Date(unixtimeExpireTime), //12 hours
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
  db.get(strCommand, [req.cookies.SESSION_ID], async function(error, result) {
    if (error) {
      console.error("DB error searching sessions: \n\t" + error)
      res.status(500).json({})
    } else if (result == null) {
      // No session found
      res.status(401).json({})
    } else {
      // Delete all sessions tied to the user
      strCommand = `DELETE FROM tblSessions WHERE UserID = ?`
      await db.run(strCommand, [result.UserID], function(error) {
        if (error) {
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

// Remove expired sessions
// For backend use only
function removeExpiredSessions() {
  let strCommand = `DELETE FROM tblSessions WHERE ExpiryDate <= ?`
  db.run(strCommand, [Date.now()], function(error) {
    if (error) {
      console.error("DB error deleting expired sessions: \n\t" + error)
    }
  })
}

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
  if (req.body.email && req.body.bio && req.body.password && req.body.firstName && req.body.lastName && req.body.middleInitial) {
    // Hash password to store in db
    const intSaltRounds = 10
    bcrypt.hash(req.body.password, intSaltRounds, (err, hash) => {
      if (err) {
        console.error(err.message)
        return res.status(500).json({
          "message": err.message
        })
      }
      else {
        const strNewID = uuidv4()
        const strSqlQuery = "INSERT INTO tblUsers (UserID, Email, FirstName, LastName, MiddleInitial, Password, Bio) VALUES (?, ?, ?, ?, ?, ?, ?)"
        const arrParams = [strNewID, req.body.email, req.body.firstName, req.body.lastName, req.body.middleInitial, hash, req.body.bio]
        db.run(strSqlQuery, arrParams, (err) => {
          if (err) {
            console.error(err.message)
            return res.status(500).json({
              message: err.message
            })
          }
          else {
            return res.status(201).json({
              "message": "User Created",
              "userID": strNewID
            })
          }
        })
      }
    })
  } else {
    return res.status(400).json({ "message": "Invalid Argument" })
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
  if (req.body.email && req.body.newPassword && req.body.firstName && req.body.lastName && req.body.title && req.body.phoneNumber && req.body.otherContacts) {
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
    if (error) {
      console.error(error.message)
      return res.status(400).json({
        message: error.message
      })
    }
    else {
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
  strSqlQuery = "SELECT * FROM tblUsers WHERE UserID = ?;"

  db.get(strSqlQuery, req.params.userId, (err, row) => {
    if (err) {
      console.error(err.message)
      return res.status(500).json({
        message: err.message
      })
    }
    if (!row) {
      return res.status(404).json({
        message: "No user found!"
      })
    }
    else {
      return res.status(200).json({
        userID: row.UserID,
        email: row.Email,
        firstName: row.FirstName,
        lastName: row.LastName,
        middleInitial: row.MiddleInitial,
        bio: row.Bio
      })
    }
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
    if (error) {
      console.error(error.message)
      return res.status(400).json({
        message: error.message
      })
    }
    else {
      if (!result) {
        return res.status(400).json({
          message: `User ${req.params.email} not found`
        })
      }
      else {
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

// Read all users
// GET /users
// with cookie SESSION_ID
// Returns 200 OK and array of all users if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 500 Internal Server Error on database failure
app.get('/users', validateSession, (req, res) => {
  db.all("SELECT UserID, Email, FirstName, LastName, MiddleInitial, Bio FROM tblUsers;", [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(rows);
  });
});

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
    if (error) {
      console.error(error.message)
      return res.status(400).json({
        message: error.message
      })
    }
    else {
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
    if (error) {
      console.error(error.message)
      return res.status(400).json({
        message: error.message
      })
    }
    else {
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
// with body.courseCode(e.g. CSC 3100-001), body.courseName(e.g. Web Dev)
// with cookie SESSION_ID
// Returns 201 Created with courseId if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.post('/course', validateSession, (req, res, next) => {
  // Validate parameters
  if (req.body.courseCode == null || req.body.courseName == null) {
    res.status(400).json({})
    return
  } else {
    // Get the user ID from the session
    let strCommand = `SELECT UserID FROM tblSessions WHERE SessionID = ?`
    db.get(strCommand, [req.cookies.SESSION_ID], function(err, result) {
      if (err) {
        console.error(err)
        res.status(500).json({})
      } else {
        // Toss the info in the db
        let strCommand = `INSERT INTO tblCourses (CourseID, CourseCode, CourseName, OwnerID) VALUES(?, ?, ?, ?)`
        let strCourseId = uuidv4()
        db.run(strCommand, [strCourseId, req.body.courseCode, req.body.courseName, result.UserID], function(error) {
          if (error) {
            console.error(error)
            res.status(500).json({})
          } else {
            res.status(201).json({ courseId: strCourseId })
          }
        })
      }
    })
  }
})

// Update course
// PUT /course/{courseId}
// with body.courseCode(e.g. CSC 3100-001), body.courseName(e.g. Web Dev)
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 404 Not Found if the course doesn't exist
// Returns 400 Bad Request otherwise
app.put('/course/:courseId', validateSession, (req, res, next) => {
  // Validate parameters
  if (req.body.courseCode == null || req.body.courseName == null || !regexUUID.test(req.params.courseId)) {
    res.status(400).json({})
    return
  } else {
    // Get the user ID from the session
    let strCommand = `SELECT UserID FROM tblSessions WHERE SessionID = ?`
    db.get(strCommand, [req.cookies.SESSION_ID], function(err, result) {
      if (err) {
        console.error(err)
        res.status(500).json({})
        return
      } else {
        const strUserId = result.UserID
        // Check if the user is the owner of the course
        let strCommand = `SELECT OwnerID FROM tblCourses WHERE CourseID = ?`
        db.get(strCommand, [req.params.courseId], function(error, result) {
          if (error) {
            console.error("DB error searching courses: \n\t" + error)
            res.status(500).json({})
            return
          } else if (result == null) {
            // Course not found
            // Womp womp
            res.status(404).json({})
            return
          } else if (result.OwnerID != strUserId) {
            // Toss the info in the db
            let strCommand = `UPDATE tblCourses SET CourseCode = ?, CourseName = ? WHERE CourseID = ?`
            db.run(strCommand, [req.body.courseCode, req.body.courseName, req.params.courseId], function(error) {
              if (error) {
                console.error(error)
                res.status(500).json({})
                return
              } else {
                res.status(201).json({})
                return
              }
            })
          } else {
            // Bozo is not authorized to modify this course
            // L
            res.status(401).json({})
            return
          }
        })
      }
    })
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
//   courseName: string,
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
  // v A l I d A t E
  if (regexUUID.test(req.params.courseId)) {
    // TODO validate courseId and get course
    res.status(200).json({
      ownerId: "ownerId",
      courseCode: "CSC 3100-001",
      courseName: "Web Dev",
      groupList: [
        "groupId0",
        "groupId1"
      ],
      studentList: [
        "studentId0",
        "studentId1"
      ]
    })
    // Check if the course is owned by or accessible to the current user
    let strCommand = `SELECT UserID FROM tblSessions WHERE SessionID = ?`
    db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
      if (error) {
        // Cringe
        console.error("DB error searching sessions: \n\t" + error)
        res.status(500).json({})
        return
      } else {
        const strUserId = result.UserID
        // User is owner of course?
        let strCommand = `SELECT OwnerID FROM tblCourses WHERE CourseID = ?`
        db.get(strCommand, [req.params.courseID], function(error, result) {
          if (error) {
            console.error("DB error searching courses: \n\t" + error)
            res.status(500).json({})
            return
          } else if (result.OwnerID == strUserId) {
            // User owns the course
            let objCourse = compileCourseObject(req.params.courseId)
            if (objCourse == null) {
              // Error
              res.status(500).json({})
              return
            } else {
              res.status(200).json(compileCourseObject(req.params.courseId))
              return
            }
          } else {
            // User is student in course?
            strCommand = `SELECT * FROM tblStudents WHERE CourseID = ? AND StudentID = ?`
            db.get(strCommand, [req.params.courseId, strUserId], function(error, result) {
              if (error) {
                console.error("DB error searching courses: \n\t" + error)
                res.status(500).json({})
                return
              } else if (result != null) {
                // User is student
                let objCourse = compileCourseObject(req.params.courseId)
                if (objCourse == null) {
                  // Error
                  res.status(500).json({})
                  return
                } else {
                  res.status(200).json(compileCourseObject(req.params.courseId))
                  return
                }
              } else {
                // Bozo is not authorized to view this course
                res.status(401).json({ user: "L Red Team" })
                return
              }
            })
          }
        })

      }
    })
  } else {
    res.status(400).json({})
  }
})

async function compileCourseObject(courseId) {
  // Compile the course object from the database result
  let objCourse = {
    ownerId: "",
    courseCode: "",
    courseName: "",
    groupList: [],
    studentList: []
  }
  let strCommand = `SELECT * FROM tblCourses WHERE CourseID = ?`
  await db.get(strCommand, [courseId], function(error, result) {
    if (error) {
      console.error("DB error searching courses: \n\t" + error)
      return null
    } else {
      objCourse.ownerId = result.OwnerID
      objCourse.courseCode = result.CourseCode
      objCourse.courseName = result.CourseName
    }
  })
  strCommand = `SELECT * FROM tblGroups WHERE CourseID = ?`
  await db.all(strCommand, [courseId], function(error, result) {
    if (error) {
      console.error("DB error searching courses: \n\t" + error)
      return null
    } else if (result != null) {
      objCourse.groupList.push(...result.GroupID)
    }
  })
  strCommand = `SELECT * FROM tblStudents WHERE CourseID = ?`
  await db.get(strCommand, [courseId], function(error, result) {
    if (error) {
      console.error("DB error searching courses: \n\t" + error)
      return null
    } else if (result != null) {
      objCourse.studentList.push(...result.UserID)
    }
  })
  return objCourse
}

// Read all courses
// GET /courses
// with cookie SESSION_ID
// Returns 200 OK and array of all course records if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 500 Internal Server Error on database failure
app.get('/courses', validateSession, (req, res) => {
  db.all("SELECT * FROM tblCourses;", [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(rows);
  });
});

// Delete course
// DELETE /course/{courseId}
// with cookie SESSION_ID
// Returns 201 Created if successfully deleted
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.delete('/course/:courseId', validateSession, async (req, res, next) => {
  // validate courseId
  if (!regexUUID.test(req.params.courseId)) {
    res.status(400).json({})
    return
  }
  objError = null

  // Validate permission
  let resultSession = null
  let resultCourse = null
  let strCommand = `SELECT UserID FROM tblSessions WHERE SessionID = ?`
  await db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
    objError = error
    resultSession = result
  })
  await new Promise(r => setTimeout(r, intTimeout))
  if (objError) {
    console.error("DB error searching sessions: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultSession == null) {
    res.status(401).json({})
    return
  }

  // You know the rules, and so do I
  // Authentication's what I'm thinking of
  // You wouldn't get this from any API
  strCommand = `SELECT * FROM tblCourses WHERE CourseID = ?`
  await db.get(strCommand, [req.params.courseId], function(error, result) {
    objError = error
    resultCourse = result
  })
  await new Promise(r => setTimeout(r, intTimeout))
  if (objError) {
    console.error("DB error searching course: \n\t" + objError)
    res.status(500).json({})
  } else if (resultSession == null) {
    // Course not found
    res.status(404).json({})
  } else if (resultCourse.OwnerID != resultSession.UserID) {
    // Unauthorized
    res.status(401).json({})
  }

  // Delete all responses related to the course
  let resultResponses = null
  strCommand = `DELETE FROM tblResponses WHERE ReviewSpecID IN (SELECT ReviewSpecID FROM tblReviewSpecifications WHERE CourseID = ?)`
  await db.run(strCommand, [req.params.courseId], function(error) {
    objError = error
  })
  await new Promise(r => setTimeout(r, intTimeout))
  if (objError) {
    console.error("DB error deleting responses: \n\t" + objError)
    res.status(500).json({})
    return
  }

  // Delete all review specifications related to the course
  strCommand = `DELETE FROM tblReviewSpecifications WHERE CourseID = ?`
  await db.run(strCommand, [req.params.courseId], function(error) {
    objError = error
  })
  await new Promise(r => setTimeout(r, intTimeout))
  if (objError) {
    console.error("DB error deleting review specs: \n\t" + objError)
    res.status(500).json({})
    return
  }

  // Delete every students' relationship to the course
  strCommand = `DELETE FROM tblStudents WHERE CourseID = ?`
  await db.run(strCommand, [req.params.courseId], function(error) {
    objError = error
  })
  await new Promise(r => setTimeout(r, intTimeout))
  if (objError) {
    console.error("DB error removing students from course: \n\t" + objError)
    res.status(500).json({})
    return
  }

  // Delete all groups related to the course
  strCommand = `DELETE FROM tblGroups WHERE CourseID = ?`
  await db.run(strCommand, [req.params.courseId], function(error) {
    objError = error
  })
  await new Promise(r => setTimeout(r, intTimeout))
  if (objError) {
    console.error("DB error deleting course: \n\t" + objError)
    res.status(500).json({})
    return
  }

  // Delete the course
  strCommand = `DELETE FROM tblCourses WHERE CourseID = ?`
  await db.run(strCommand, [req.params.courseId], function(error) {
    objError = error
  })
  await new Promise(r => setTimeout(r, intTimeout))
  if (objError) {
    console.error("DB error deleting course: \n\t" + objError)
    res.status(500).json({})
    return
  }
  res.status(201).json({})
})

// Add student to course
// POST /course/{courseId}/student/{studentId}
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.post('/course/:courseId/student/:studentId', validateSession, async (req, res, next) => {
  // Validate params
  if (!regexUUID.test(req.params.courseId) || !regexUUID.test(req.params.studentId)) {
    res.status(400).json({})
    return
  }
  let objError = null

  // Check if the course exists
  let resultCourse = null
  let strCommand = `SELECT * FROM tblCourses WHERE CourseID = ?`
  await db.get(strCommand, [req.params.courseId], function(error, result) {
    objError = error
    resultCourse = result
  })
  await new Promise(r => setTimeout(r, intTimeout))
  if (objError) {
    console.error("DB error searching courses: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultCourse == null) {
    // goofy ah
    res.status(404).json({})
    return
  }

  // Check if the student exists
  let resultStudent = null
  strCommand = `SELECT * FROM tblUsers WHERE UserID = ?`
  await db.get(strCommand, [req.params.studentId], function(error, result) {
    objError = error
    resultStudent = result
  })
  await new Promise(r => setTimeout(r, intTimeout))
  if (objError) {
    console.error("DB error searching users: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultStudent == null) {
    res.status(404).json({})
    return
  }

  // Check if the current user is the owner of the course
  let resultSession = null
  strCommand = `SELECT * FROM tblSessions WHERE SessionID = ?`
  await db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
    objError = error
    resultSession = result
  })
  await new Promise(r => setTimeout(r, intTimeout))
  if (objError) {
    console.error("DB error searching sessions: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultSession.UserID != resultCourse.OwnerID) {
    res.status(401).json({})
    return
  }

  // Add the student to the course
  strCommand = `INSERT INTO tblStudents (CourseID, UserID) VALUES (?, ?)`
  await db.run(strCommand, [req.params.courseId, req.params.studentId], function(error) {
    if (error) {
      console.error("DB error adding student to course: \n\t" + error)
      res.status(500).json({})
      return
    } else {
      res.status(201).json({})
    }
  })
})

// Remove student from course
// DELETE /course/{courseId}/student/{studentId}
// with cookie SESSION_ID
// Returns 201 Created if successfully removed
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.delete('/course/:courseId/student/:studentId', validateSession, async (req, res, next) => {
  // Validate params
  if (!regexUUID.test(req.params.courseId) || !regexUUID.test(req.params.studentId)) {
    res.status(400).json({})
    return
  }
  let objError = null

  // Check if the course exists
  let resultCourse = null
  let strCommand = `SELECT * FROM tblCourses WHERE CourseID = ?`
  await db.get(strCommand, [req.params.courseId], function(error, result) {
    objError = error
    resultCourse = result
  })
  await new Promise(r => setTimeout(r, intTimeout))
  if (objError) {
    console.error("DB error searching courses: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultCourse == null) {
    // goofy ah
    res.status(404).json({})
    return
  }

  // Check if the student exists
  let resultStudent = null
  strCommand = `SELECT * FROM tblUsers WHERE UserID = ?`
  await db.get(strCommand, [req.params.studentId], function(error, result) {
    objError = error
    resultStudent = result
  })
  await new Promise(r => setTimeout(r, intTimeout))
  if (objError) {
    console.error("DB error searching users: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultStudent == null) {
    res.status(404).json({})
    return
  }

  // Check if the current user is the owner of the course
  let resultSession = null
  strCommand = `SELECT * FROM tblSessions WHERE SessionID = ?`
  await db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
    objError = error
    resultSession = result
  })
  await new Promise(r => setTimeout(r, intTimeout))
  if (objError) {
    console.error("DB error searching sessions: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultSession.UserID != resultCourse.OwnerID) {
    res.status(401).json({})
    return
  }

  // Remove the student from the course
  strCommand = `DELETE FROM tblStudents WHERE CourseID = ? AND StudentID = ?`
  await db.run(strCommand, [req.params.courseId, req.params.studentId], function(error) {
    objError = error
  })
  if (objError) {
    console.error("DB error adding student to course: \n\t" + objError)
    res.status(500).json({})
    return
  }
  res.status(201).json({})
})

// GROUP //

// Add a group to the course
// POST /course/{courseId}/group
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.post('/course/:courseId/group', validateSession, async (req, res, next) => {
  // Validate params
  if (!regexUUID.test(req.params.courseId)) {
    res.status(400).json({})
  }
  let objError = null

  // Check if the course exists
  let resultCourse = null
  let strCommand = `SELECT * FROM tblCourses WHERE CourseID = ?`
  await db.get(strCommand, [req.params.courseId], function(error, result) {
    objError = error
    resultCourse = result
  })
  if (objError) {
    console.error("DB error searching courses: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultCourse == null) {
    // goofy ah
    res.status(404).json({})
    return
  }

  // Check if the current user is the owner of the course or a student in the course
  let resultSession = null
  let resultStudent = null
  strCommand = `SELECT * FROM tblSessions WHERE SessionID = ?`
  await db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
    objError = error
    resultSession = result
  })
  if (objError) {
    console.error("DB error searching sessions: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultSession == null) {
    res.status(401).json({})
    return
  }
  strCommand = `SELECT * FROM tblStudents WHERE CourseID = ? AND StudentID = ?`
  await db.get(strCommand, [req.params.courseId, resultSession.UserID], function(error, result) {
    objError = error
    resultStudent = result
  })
  if (objError) {
    console.error("DB error searching students: \n\t" + objError)
    res.status(500).json({})
    return
  }
  if (resultSession.UserID != resultCourse.OwnerID || resultSession.UserID != resultStudent.StudentID) {

  }
  // Create the group
  let strGroupId = uuidv4()
  strCommand = `INSERT INTO tblGroups (GroupID, CourseID) VALUES (?, ?)`
  await db.run(strCommand, [strGroupId, req.params.courseId], function(error) {
    if (error) {
      console.error("DB error creating group: \n\t" + error)
      res.status(500).json({})
      return
    } else {
      res.status(201).json({ groupId: strGroupId })
    }
  })
})

// Update group
// PUT /group/{groupId}
// with body.groupName
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.put('/group/:groupId', validateSession, async (req, res, next) => {
  // Validate param
  if (!regexUUID.test(req.params.groupId) || req.body.groupName == null) {
    res.status(400).json({})
    return
  }
  let objError = null

  // Check if the group exists
  let resultGroup = null
  let strCommand = `SELECT * FROM tblGroups WHERE GroupID = ?`
  await db.get(strCommand, [req.params.groupId], function(error, result) {
    objError = error
    resultGroup = result
  })
  if (objError) {
    console.error("DB error searching groups: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultGroup == null) {
    res.status(404).json({})
    return
  }

  // Update the group
  strCommand = `UPDATE tblGroups SET GroupName = ? WHERE GroupID = ?`
  await db.run(strCommand, [req.body.groupName, req.params.groupId], function(error) {
    if (error) {
      console.error("DB error updating group: \n\t" + error)
      res.status(500).json({})
      return
    } else {
      res.status(201).json({})
    }
  })
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
  // Validate param
  if (!regexUUID.test(req.params.groupId)) {
    res.status(400).json({})
    return
  }
  let objError = null

  // Check if the group exists
  let resultGroup = null
  let strCommand = `SELECT * FROM tblGroups WHERE GroupID = ?`
  db.get(strCommand, [req.params.groupId], function(error, result) {
    objError = error
    resultGroup = result
  })
  if (objError) {
    console.error("DB error searching groups: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultGroup == null) {
    res.status(404).json({})
    return
  }

  // Assemble the group object
  let objGroup = {
    groupId: resultGroup.GroupID,
    courseID: resultGroup.CourseID,
    groupName: resultGroup.GroupName,
    groupMembers: []
  }

  // Get the group members
  let resultGroupMembers = null
  strCommand = `SELECT * FROM tblStudents WHERE GroupID = ?`
  db.all(strCommand, [req.params.groupId], function(error, result) {
    objError = error
    resultGroupMembers = result
  })
  if (objError) {
    console.error("DB error searching group members: \n\t" + objError)
    res.status(500).json({})
    return
  }
  objGroup.groupMembers.push(...resultGroupMembers)

  // Return the group object
  return objGroup
})

// Read all groups
// GET /groups
// with cookie SESSION_ID
// Returns 200 OK and array of all group records if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 500 Internal Server Error on database failure
app.get('/groups', validateSession, (req, res) => {
  db.all("SELECT * FROM tblGroups;", [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(rows);
  });
});

// Delete group
// DELETE /group/{groupId}
// with cookie SESSION_ID
// Returns 201 Created if successfully deleted
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.delete('/group/:groupId', validateSession, async (req, res, next) => {
  // Validate param
  if (!regexUUID.test(req.params.groupId)) {
    res.status(400).json({})
    return
  }
  let objError = null

  // Check if the group exists
  let resultGroup = null
  let strCommand = `SELECT * FROM tblGroups WHERE GroupID = ?`
  await db.get(strCommand, [req.params.groupId], function(error, result) {
    objError = error
    resultGroup = result
  })
  if (objError) {
    console.error("DB error searching groups: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultGroup == null) {
    res.status(404).json({})
    return
  }

  // Check if the current user is the owner of the parent course
  let resultSession = null
  let resultCourse = null
  strCommand = `SELECT * FROM tblSessions WHERE SessionID = ?`
  await db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
    objError = error
    resultSession = result
  })
  if (objError) {
    console.error("DB error searching sessions: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultSession == null) {
    res.status(401).json({})
    return
  }

  strCommand = `SELECT * FROM tblCourses WHERE CourseID = ?`
  await db.get(strCommand, [resultGroup.CourseID], function(error, result) {
    objError = error
    resultCourse = result
  })
  if (objError) {
    console.error("DB error searching courses: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultCourse == null) {
    res.status(404).json({})
    return
  }

  if (resultSession.UserID != resultCourse.OwnerID) {
    res.status(401).json({})
    return
  }

  // Delete all responses related to the group
  strCommand = `DELETE FROM tblResponses WHERE GroupID = ?`
  await db.run(strCommand, [req.params.groupId], function(error) {
    objError = error
  })
  if (objError) {
    console.error("DB error deleting responses: \n\t" + error)
    res.status(500).json({})
    return
  }

  // Disconnect all students from the group
  strCommand = `UPDATE tblStudents SET GroupID = NULL WHERE GroupID = ?`
  await db.run(strCommand, [req.params.groupId], function(error) {
    objError = error
  })
  if (objError) {
    console.error("DB error disconnecting students: \n\t" + error)
    res.status(500).json({})
    return
  }

  // Delete the group
  strCommand = `DELETE FROM tblGroups WHERE GroupID = ?`
  await db.run(strCommand, [req.params.groupId], function(error) {
    objError = error
  })
  if (error) {
    console.error("DB error deleting group: \n\t" + error)
    res.status(500).json({})
    return
  } else {
    res.status(201).json({})
  }
})

// Add student to group
// POST /group/{groupId}/student/{studentId}
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.post('/group/:groupId/student/:studentId', validateSession, async (req, res, next) => {
  // Validate params
  if (!regexUUID.test(req.params.groupId) || !regexUUID.test(req.params.studentId)) {
    res.status(400).json({})
  }
  let objError = null

  // Check if the group exists
  let resultGroup = null
  let strCommand = `SELECT * FROM tblGroups WHERE GroupID = ?`
  await db.get(strCommand, [req.params.groupId], function(error, result) {
    objError = error
    resultGroup = result
  })
  if (objError) {
    console.error("DB error searching groups: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultGroup == null) {
    res.status(404).json({})
    return
  }

  // Check if the target student exists
  let resultTargetStudent = null
  strCommand = `SELECT * FROM tblUsers WHERE UserID = ?`
  await db.get(strCommand, [req.params.studentId], function(error, result) {
    objError = error
    resultTargetStudent = result
  })
  if (objError) {
    console.error("DB error searching users: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultTargetStudent == null) {
    res.status(404).json({})
    return
  }

  // Check if the current user is the owner of the course or is in the group
  let resultSession = null
  let resultCourse = null
  let resultStudent = null
  strCommand = `SELECT * FROM tblSessions WHERE SessionID = ?`
  await db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
    objError = error
    resultSession = result
  })
  if (objError) {
    console.error("DB error searching sessions: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultSession == null) {
    res.status(401).json({})
    return
  }

  strCommand = `SELECT * FROM tblCourses WHERE CourseID = ?`
  await db.get(strCommand, [resultGroup.CourseID], function(error, result) {
    objError = error
    resultCourse = result
  })
  if (objError || resultCourse == null) {
    console.error("DB error searching courses: \n\t" + objError)
    res.status(500).json({})
    return
  }

  strCommand = `SELECT * FROM tblStudents WHERE GroupID = ? AND UserID = ?`
  await db.get(strCommand, [req.params.groupId, resultSession.UserID], function(error, result) {
    objError = error
    resultStudent = result
  })
  if (objError) {
    console.error("DB error searching students: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultStudent == null) {
    res.status(401).json({})
    return
  }

  if (resultSession.UserID != resultCourse.OwnerID && resultSession.UserID != resultStudent.UserID) {
    res.status(401).json({})
    return
  }

  // Add the student to the group
  strCommand = `UPDATE tblStudents SET GroupID = ? WHERE UserID = ?`
  await db.run(strCommand, [req.params.groupId, req.params.studentId], function(error) {
    objError = error
  })
  if (objError) {
    console.error("DB error adding student to group: \n\t" + objError)
    res.status(500).json({})
    return
  } else {
    res.status(201).json({})
  }
})

// Read all students
// GET /students
// with cookie SESSION_ID
// Returns 200 OK and array of all student records if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 500 Internal Server Error on database failure
app.get('/students', validateSession, (req, res) => {
  db.all("SELECT * FROM tblStudents;", [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(rows);
  });
});

// Remove student from group
// DELETE /group/{groupId}/student/{studentId}
// with cookie SESSION_ID
// Returns 201 Created if successfully removed
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.delete('/group/:groupId/student/:studentId', validateSession, async (req, res, next) => {
  // Validate params
  if (!regexUUID.test(req.params.groupId) || !regexUUID.test(req.params.studentId)) {
    res.status(400).json({})
    return
  }
  let objError = null

  // Check if the group exists
  let resultGroup = null
  let strCommand = `SELECT * FROM tblGroups WHERE GroupID = ?`
  await db.get(strCommand, [req.params.groupId], function(error, result) {
    objError = error
    resultGroup = result
  })
  if (objError) {
    console.error("DB error searching groups: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultGroup == null) {
    res.status(404).json({})
    return
  }

  // Check if the target student exists
  let resultTargetStudent = null
  strCommand = `SELECT * FROM tblUsers WHERE UserID = ? AND GroupID = ?`
  await db.get(strCommand, [req.params.studentId, req.params.groupId], function(error, result) {
    objError = error
    resultTargetStudent = result
  })
  if (objError) {
    console.error("DB error searching users: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultTargetStudent == null) {
    res.status(404).json({})
    return
  }

  // Check if the current user is the owner of the course or is the target student
  let resultSession = null
  let resultCourse = null
  strCommand = `SELECT * FROM tblSessions WHERE SessionID = ?`
  await db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
    objError = error
    resultSession = result
  })
  if (objError) {
    console.error("DB error searching sessions: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultSession == null) {
    res.status(401).json({})
    return
  }

  strCommand = `SELECT * FROM tblCourses WHERE CourseID = ?`
  await db.get(strCommand, [resultGroup.CourseID], function(error, result) {
    objError = error
    resultCourse = result
  })
  if (objError || resultCourse == null) {
    console.error("DB error searching courses: \n\t" + objError)
    res.status(500).json({})
    return
  }

  if (resultSession.UserID != resultCourse.OwnerID && resultSession.UserID != resultTargetStudent.UserID) {
    res.status(401).json({})
    return
  }

  // It's...removing time
  strCommand = `UPDATE tblStudents SET GroupID = NULL WHERE UserID = ?`
  await db.run(strCommand, [req.params.studentId], function(error) {
    objError = error
  })
  if (objError) {
    console.error("DB error removing student from group: \n\t" + objError)
    res.status(500).json({})
    return
  } else {
    res.status(201).json({})
  }
})

// Get all responses tied to this group
// GET /group/{groupId}/responses
// with cookie SESSION_ID
// Returns 200 OK and array of all response records if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 500 Internal Server Error on database failure
app.get('/group/:groupId/responses', validateSession, (req, res) => {
  let strCommand = `SELECT ResponseID FROM tblResponses WHERE GroupID = ?`
  db.all(strCommand, [req.params.groupId], function(error, result) {
    if (error) {
      console.error("DB error searching responses: \n\t" + error)
      res.status(500).json({})
      return
    } else if (result == null) {
      // No responses found
      res.status(404).json({})
      return
    } else {
      res.status(200).json(result)
      return
    }
  })
})

// REVIEW SPEC //

// Create review spec
// POST /course/{courseId}/reviewSpec
// with body.liveDate body.expiryDate
// with cookie SESSION_ID
// Returns 201 Created and reviewSpecId if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.post('/course/:courseId/reviewSpec', validateSession, async (req, res, next) => {
  // Validate params
  if (!regexUUID.test(req.params.courseId) || !req.body.liveDate || !req.body.expiryDate) {
    res.status(400).json({})
    return
  }
  let objError = null

  // Check if the course exists
  let resultCourse = null
  let strCommand = `SELECT * FROM tblCourses WHERE CourseID = ?`
  await db.get(strCommand, [req.params.courseId], function(error, result) {
    objError = error
    resultCourse = result
  })
  if (objError) {
    console.error("DB error searching courses: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultCourse == null) {
    res.status(404).json({})
    return
  }

  // Check if the current user is the owner of the course
  let resultSession = null
  strCommand = `SELECT * FROM tblSessions WHERE SessionID = ?`
  await db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
    objError = error
    resultSession = result
  })
  if (objError) {
    console.error("DB error searching sessions: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultSession == null) {
    res.status(401).json({})
    return
  }

  if (resultSession.UserID != resultCourse.OwnerID) {
    res.status(401).json({})
    return
  }

  // Create the review spec
  let strReviewSpecId = uuidv4()
  strCommand = `INSERT INTO tblReviewSpecifications (ReviewSpecID, CourseID, LiveDate, ExpiryDate) VALUES (?, ?, ?, ?)`
  await db.run(strCommand, [strReviewSpecId, req.params.courseId, req.body.liveDate, req.body.expiryDate], function(error) {
    objError = error
  })
  if (objError) {
    console.error("DB error creating review spec: \n\t" + objError)
    res.status(500).json({})
    return
  } else {
    res.status(201).json({ reviewSpecId: strReviewSpecId })
  }
})

// Update review spec
// PUT /reviewSpec/{reviewSpecId}
// with body.liveDate body.expiryDate
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.put('/reviewSpec/:reviewSpecId', validateSession, async (req, res, next) => {
  // Validate params
  if (!regexUUID.test(req.params.reviewSpecId) || !req.body.liveDate || !req.body.expiryDate) {
    res.status(400).json({})
    return
  }
  let objError = null

  // Check if the review spec exists
  let resultReviewSpec = null
  let strCommand = `SELECT * FROM tblReviewSpecifications WHERE ReviewSpecID = ?`
  await db.get(strCommand, [req.params.reviewSpecId], function(error, result) {
    objError = error
    resultReviewSpec = result
  })
  if (objError) {
    console.error("DB error searching review specs: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultReviewSpec == null) {
    res.status(404).json({})
    return
  }

  // Check if the current user is the owner of the course
  let resultSession = null
  let resultCourse = null
  strCommand = `SELECT * FROM tblSessions WHERE SessionID = ?`
  await db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
    objError = error
    resultSession = result
  })
  if (objError) {
    console.error("DB error searching sessions: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultSession == null) {
    res.status(401).json({})
    return
  }

  strCommand = `SELECT * FROM tblCourses WHERE CourseID = ?`
  await db.get(strCommand, [resultReviewSpec.CourseID], function(error, result) {
    objError = error
    resultCourse = result
  })
  if (objError || resultCourse == null) {
    console.error("DB error searching courses: \n\t" + objError)
    res.status(500).json({})
    return
  }

  if (resultSession.UserID != resultCourse.OwnerID) {
    res.status(401).json({})
    return
  }

  // Update the review spec
  strCommand = `UPDATE tblReviewSpecifications SET LiveDate = ?, ExpiryDate = ? WHERE ReviewSpecID = ?`
  await db.run(strCommand, [req.body.liveDate, req.body.expiryDate, req.params.reviewSpecId], function(error) {
    objError = error
  })
  if (objError) {
    console.error("DB error updating review spec: \n\t" + objError)
    res.status(500).json({})
    return
  } else {
    res.status(201).json({})
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
app.get('/reviewSpec/:reviewSpecId', validateSession, async (req, res, next) => {
  // Validate param
  if (!regexUUID.test(req.params.reviewSpecId)) {
    res.status(400).json({})
    return
  }
  let objError = null

  // Check if the review spec exists
  let resultReviewSpec = null
  let strCommand = `SELECT * FROM tblReviewSpecifications WHERE ReviewSpecID = ?`
  await db.get(strCommand, [req.params.reviewSpecId], function(error, result) {
    objError = error
    resultReviewSpec = result
  })
  if (objError) {
    console.error("DB error searching review specs: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultReviewSpec == null) {
    res.status(404).json({})
    return
  }

  // Check if the current user is the owner of the course or is a student in the course
  let resultSession = null
  let resultCourse = null
  let resultStudent = null
  strCommand = `SELECT * FROM tblSessions WHERE SessionID = ?`
  await db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
    objError = error
    resultSession = result
  })
  if (objError) {
    console.error("DB error searching sessions: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultSession == null) {
    res.status(401).json({})
    return
  }

  strCommand = `SELECT * FROM tblCourses WHERE CourseID = ?`
  await db.get(strCommand, [resultReviewSpec.CourseID], function(error, result) {
    objError = error
    resultCourse = result
  })
  if (objError || resultCourse == null) {
    // Something's rotten in the state of Denmark
    console.error("DB error searching courses: \n\t" + objError)
    res.status(500).json({})
    return
  }

  strCommand = `SELECT * FROM tblStudents WHERE CourseID = ? AND UserID = ?`
  await db.get(strCommand, [resultReviewSpec.CourseID, resultSession.UserID], function(error, result) {
    objError = error
    resultStudent = result
  })
  if (objError) {
    console.error("DB error searching students: \n\t" + objError)
    res.status(500).json({})
    return
  }

  if (resultSession.UserID != resultCourse.OwnerID && resultSession.UserID != resultStudent.UserID) {
    res.status(401).json({})
    return
  }

  // Assemble the review spec object
  let objReviewSpec = {
    reviewSpecId: resultReviewSpec.ReviewSpecID,
    courseId: resultReviewSpec.CourseID,
    liveDate: resultReviewSpec.LiveDate,
    expiryDate: resultReviewSpec.ExpiryDate
  }

  // Return the review spec object
  res.status(200).json(objReviewSpec)
})

// Delete review spec
// DELETE /reviewSpec/{reviewSpecId}
// with cookie SESSION_ID
// Returns 201 Created if successfully deleted
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.delete('/reviewSpec/:reviewSpecId', validateSession, async (req, res, next) => {
  // Validate param
  if (!regexUUID.test(req.params.reviewSpecId)) {
    res.status(400).json({})
    return
  }
  let objError = null

  // Check if the review spec exists
  let resultReviewSpec = null
  let strCommand = `SELECT * FROM tblReviewSpecifications WHERE ReviewSpecID = ?`
  await db.get(strCommand, [req.params.reviewSpecId], function(error, result) {
    objError = error
    resultReviewSpec = result
  })
  if (objError) {
    console.error("DB error searching review specs: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultReviewSpec == null) {
    res.status(404).json({})
    return
  }

  // Check if the current user is the owner of the course
  let resultSession = null
  let resultCourse = null

  strCommand = `SELECT * FROM tblSessions WHERE SessionID = ?`
  await db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
    objError = error
    resultSession = result
  })
  if (objError) {
    console.error("DB error searching sessions: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultSession == null) {
    res.status(401).json({})
    return
  }

  strCommand = `SELECT * FROM tblCourses WHERE CourseID = ?`
  await db.get(strCommand, [resultReviewSpec.CourseID], function(error, result) {
    objError = error
    resultCourse = result
  })
  if (objError || resultCourse == null) {
    console.error("DB error searching courses: \n\t" + objError)
    res.status(500).json({})
    return
  }

  if (resultSession.UserID != resultCourse.OwnerID) {
    res.status(401).json({})
    return
  }

  // Delete the review spec
  strCommand = `DELETE FROM tblReviewSpecifications WHERE ReviewSpecID = ?`
  await db.run(strCommand, [req.params.reviewSpecId], function(error) {
    objError = error
  })
  if (objError) {
    console.error("DB error deleting review spec: \n\t" + objError)
    res.status(500).json({})
    return
  } else {
    res.status(201).json({})
  }
})

// RESPONSE //

// Create response
// POST /group/{groupId}/response/{reviewSpecId}
// with body.targetId body.publicFeedback body.privateFeedback
// with cookie SESSION_ID
// Returns 201 Created if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 409 Conflict if the response already exists
// Returns 400 Bad Request otherwise
app.post('/group/:groupId/response/:reviewSpecId', validateSession, async (req, res, next) => {
  // Validate params
  if (!regexUUID.test(req.params.groupId) || !regexUUID.test(req.params.reviewSpecId) || !regexUUID.test(req.body.targetId) || !req.body.publicFeedback || !req.body.privateFeedback) {
    res.status(400).json({})
    return
  }
  let objError = null

  // Check if the group exists
  let resultGroup = null
  let strCommand = `SELECT * FROM tblGroups WHERE GroupID = ?`
  await db.get(strCommand, [req.params.groupId], function(error, result) {
    objError = error
    resultGroup = result
  })
  if (objError) {
    console.error("DB error searching groups: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultGroup == null) {
    res.status(404).json({})
    return
  }

  // Check if the review spec exists
  let resultReviewSpec = null
  strCommand = `SELECT * FROM tblReviewSpecifications WHERE ReviewSpecID = ?`
  await db.get(strCommand, [req.params.reviewSpecId], function(error, result) {
    objError = error
    resultReviewSpec = result
  })
  if (objError) {
    console.error("DB error searching review specs: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultReviewSpec == null) {
    res.status(404).json({})
    return
  }

  // Check if any reviews of the same spec by the same author for the same target in the same group exist
  let resultSession = null
  let resultResponse = null
  strCommand = `SELECT * FROM tblSessions WHERE SessionID = ?`
  await db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
    objError = error
    resultSession = result
  })
  if (objError) {
    console.error("DB error searching sessions: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultSession == null) {
    res.status(401).json({})
    return
  }

  strCommand = `SELECT * FROM tblResponses WHERE GroupID = ? AND ReviewSpecID = ? AND ReviewerID = ? AND TargetID = ?`
  await db.get(strCommand, [req.params.groupId, req.params.reviewSpecId, resultSession.UserID, req.body.targetId], function(error, result) {
    objError = error
    resultResponse = result
  })
  if (objError) {
    console.error("DB error searching responses: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultResponse != null) {
    res.status(409).json({})
    return
  }

  // Create the response
  let strResponseId = uuidv4()
  strCommand = `INSERT INTO tblResponses (ResponseID, GroupID, ReviewSpecID, ReviewerID, TargetID, PublicFeedback, PrivateFeedback) VALUES (?, ?, ?, ?, ?, ?, ?)`
  await db.run(strCommand, [strResponseId, req.params.groupId, req.params.reviewSpecId, resultSession.UserID, req.body.targetId, req.body.publicFeedback, req.body.privateFeedback], function(error) {
    objError = error
  })
  if (objError) {
    console.error("DB error creating response: \n\t" + objError)
    res.status(500).json({})
    return
  }
})

// Search for response ids
// GET /responses
// with querystring groupId reviewSpecId reviewerId targetId
// with cookie SESSION_ID
// Returns 200 OK and array of all response records if successful
// Returns 500 Internal Server Error on database failure
app.get('/responses', validateSession, async (req, res) => {
  let objError = null
  let resultResponses = null
  let strCommand = `SELECT ResponseID FROM tblResponses`
  let arrQuerys = []
  let intCount = 0

  // If querys exists, plop them in the SQLite
  if (req.query.groupId || req.query.reviewSpecId || req.query.reviewerId || req.query.targetId) {
    strCommand += ` WHERE`
  }
  if (req.query.groupId) {
    intCount++
    strCommand = strCommand + ` GroupID = ?`
    arrQuerys.push(req.query.groupId)
  }
  if (req.query.reviewSpecId) {
    if (intCount > 0) {
      strCommand = strCommand + ` AND`
    }
    intCount++
    strCommand = strCommand + ` ReviewSpecID = ?`
    arrQuerys.push(req.query.reviewSpecId)
  }
  if (req.query.reviewerId) {
    if (intCount > 0) {
      strCommand = strCommand + ` AND`
    }
    intCount++
    strCommand = strCommand + ` ReviewerID = ?`
    arrQuerys.push(req.query.reviewerId)
  }
  if (req.query.targetId) {
    if (intCount > 0) {
      strCommand = strCommand + ` AND`
    }
    intCount++
    strCommand = strCommand + ` TargetID = ?`
    arrQuerys.push(req.query.targetId)
  }

  await db.all(strCommand, arrQuerys, function(error, result) {
    objError = error
    resultResponses = result
  })
  await new Promise(r => setTimeout(r, intTimeout))
  if (objError) {
    console.error("DB error searching responses: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultResponses == null) {
    // No responses found
    res.status(404).json({})
    return
  } else {
    res.status(200).json(resultResponses)
    return
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
app.get('/response/:responseId', validateSession, async (req, res, next) => {
  // Validate param
  if (!regexUUID.test(req.params.responseId)) {
    res.status(400).json({})
    return
  }
  let objError = null

  // Check if the response exists
  let resultResponse = null
  let strCommand = `SELECT * FROM tblResponses WHERE ResponseID = ?`
  await db.get(strCommand, [req.params.responseId], function(error, result) {
    objError = error
    resultResponse = result
  })
  await new Promise(r => setTimeout(r, intTimeout))
  if (objError) {
    console.error("DB error searching responses: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultResponse == null) {
    res.status(404).json({})
    return
  }

  // Check if the current user is the reviewer or the target or the course owner
  let resultSession = null
  let resultCourse = null
  let resultGroup = null

  strCommand = `SELECT * FROM tblSessions WHERE SessionID = ?`
  await db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
    objError = error
    resultSession = result
  })
  if (objError) {
    console.error("DB error searching sessions: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultSession == null) {
    res.status(401).json({})
    return
  }

  strCommand = `SELECT * FROM tblGroups WHERE GroupID = ?`
  await db.get(strCommand, [resultResponse.GroupID], function(error, result) {
    objError = error
    resultGroup = result
  })
  if (objError || resultGroup == null) {
    console.error("DB error searching groups: \n\t" + objError)
    res.status(500).json({})
    return
  }

  strCommand = `SELECT * FROM tblCourses WHERE CourseID = ?`
  await db.get(strCommand, [resultGroup.CourseID], function(error, result) {
    objError = error
    resultCourse = result
  })
  if (objError || resultCourse == null) {
    console.error("DB error searching courses: \n\t" + objError)
    res.status(500).json({})
    return
  }

  if (resultSession.UserID != resultResponse.ReviewerID && resultSession.UserID != resultResponse.TargetID && resultSession.UserID != resultCourse.OwnerID) {
    res.status(401).json({})
    return
  }

  // Return the response object
  let objResponse = {
    responseId: resultResponse.ResponseID,
    reviewSpecId: resultResponse.ReviewSpecID,
    reviewerId: resultResponse.ReviewerID,
    targetId: resultResponse.TargetID,
    publicFeedback: resultResponse.PublicFeedback
  }

  res.status(200).json(objResponse)
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
app.get('/response/:responseId/private', validateSession, async (req, res, next) => {
  // Validate param
  if (!regexUUID.test(req.params.responseId)) {
    res.status(400).json({})
    return
  }
  let objError = null

  // Check if the response exists
  let resultResponse = null
  let strCommand = `SELECT * FROM tblResponses WHERE ResponseID = ?`
  await db.get(strCommand, [req.params.responseId], function(error, result) {
    objError = error
    resultResponse = result
  })
  if (objError) {
    console.error("DB error searching responses: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultResponse == null) {
    res.status(404).json({})
    return
  }

  // Check if the current user is the reviewer or the course owner
  let resultSession = null
  let resultCourse = null
  let resultGroup = null

  strCommand = `SELECT * FROM tblSessions WHERE SessionID = ?`
  await db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
    objError = error
    resultSession = result
  })
  if (objError) {
    console.error("DB error searching sessions: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultSession == null) {
    res.status(401).json({})
    return
  }

  strCommand = `SELECT * FROM tblGroups WHERE GroupID = ?`
  await db.get(strCommand, [resultResponse.GroupID], function(error, result) {
    objError = error
    resultGroup = result
  })
  if (objError || resultGroup == null) {
    console.error("DB error searching groups: \n\t" + objError)
    res.status(500).json({})
    return
  }

  strCommand = `SELECT * FROM tblCourses WHERE CourseID = ?`
  await db.get(strCommand, [resultGroup.CourseID], function(error, result) {
    objError = error
    resultCourse = result
  })
  if (objError || resultCourse == null) {
    console.error("DB error searching courses: \n\t" + objError)
    res.status(500).json({})
    return
  }

  if (resultSession.UserID != resultResponse.ReviewerID && resultSession.UserID != resultCourse.OwnerID) {
    res.status(401).json({})
    return
  }

  // Return the response object
  let objResponse = {
    responseId: resultResponse.ResponseID,
    reviewSpecId: resultResponse.ReviewSpecID,
    reviewerId: resultResponse.ReviewerID,
    targetId: resultResponse.TargetID,
    publicFeedback: resultResponse.PublicFeedback,
    privateFeedback: resultResponse.PrivateFeedback
  }

  res.status(200).json(objResponse)
})

// Delete response
// DELETE /response/{responseId}
// with cookie SESSION_ID
// Returns 201 Created if successfully deleted
// Returns 401 Unauthorized if the session doesn't exist
// Returns 400 Bad Request otherwise
app.delete('/response/:responseId', validateSession, async (req, res, next) => {
  // Validate param
  if (!regexUUID.test(req.params.responseId)) {
    res.status(400).json({})
    return
  }
  let objError = null

  // Check if the response exists
  let resultResponse = null
  let strCommand = `SELECT * FROM tblResponses WHERE ResponseID = ?`
  await db.get(strCommand, [req.params.responseId], function(error, result) {
    objError = error
    resultResponse = result
  })
  if (objError) {
    console.error("DB error searching responses: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultResponse == null) {
    res.status(404).json({})
    return
  }

  // Check if the current user is the course owner
  let resultSession = null
  let resultGroup = null
  let resultCourse = null

  strCommand = `SELECT * FROM tblSessions WHERE SessionID = ?`
  await db.get(strCommand, [req.cookies.SESSION_ID], function(error, result) {
    objError = error
    resultSession = result
  })
  if (objError) {
    console.error("DB error searching sessions: \n\t" + objError)
    res.status(500).json({})
    return
  } else if (resultSession == null) {
    res.status(401).json({})
    return
  }

  strCommand = `SELECT * FROM tblGroups WHERE GroupID = ?`
  await db.get(strCommand, [resultResponse.GroupID], function(error, result) {
    objError = error
    resultGroup = result
  })
  if (objError || resultGroup == null) {
    console.error("DB error searching groups: \n\t" + objError)
    res.status(500).json({})
    return
  }

  strCommand = `SELECT * FROM tblCourses WHERE CourseID = ?`
  await db.get(strCommand, [resultGroup.CourseID], function(error, result) {
    objError = error
    resultCourse = result
  })
  if (objError || resultCourse == null) {
    console.error("DB error searching courses: \n\t" + objError)
    res.status(500).json({})
    return
  }

  if (resultSession.UserID != resultCourse.OwnerID) {
    res.status(401).json({})
    return
  }

  // Delete the response
  strCommand = `DELETE FROM tblResponses WHERE ResponseID = ?`
  await db.run(strCommand, [req.params.responseId], function(error) {
    objError = error
  })
  if (objError) {
    console.error("DB error deleting response: \n\t" + objError)
    res.status(500).json({})
    return
  } else {
    res.status(201).json({})
  }
})

app.get('/coffee', (req, res, next) => {
  res.status(418).json({})
})

app.get('/ad', (req, res, next) => {
  res.status(200).json({ msg: "As Sun Tzu once said, 'Having inward spies [means] making use of officials of the enemy.' Contact: jobs@peermetric.com" })
})

// Read all responses
// GET /responses
// with cookie SESSION_ID
// Returns 200 OK and array of all peer review responses if successful
// Returns 401 Unauthorized if the session doesn't exist
// Returns 500 Internal Server Error on database failure
app.get('/responses', validateSession, (req, res) => {
  db.all("SELECT * FROM tblResponses;", [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(rows);
  });
});

// Listen
app.listen(PORT, () => {
  console.log(`API is up and running on port ${PORT}`)
})
