// Skeleton Backend for ai review site
// Trevor Clark & Joshua Rivers Haley
// Created: Apr 12, 2025

// Pull in modules
const express = require('express')
const cors = require('cors')
const uuid = require('uuid')
const fs = require('fs')

// Setup for Express
const HTTP_PORT = 8080;
var app = express();
app.use(cors());
app.use(express.json());

// Load frontend files
const pathFrontend = '../frontend/'

// serves up index.html
app.get('/', (req, res, next) => {
    try {
        res.status(200).contentType('html').send(fs.readFileSync(pathFrontend + 'index.html'))
    } catch (error) {
        console.error("/index.html : " + error)
        res.status(500)
    }
})

// servers up index.js
app.get('/scripts/index.js', (req, res, next) => {
    try {
        res.status(200).contentType('js').send(fs.readFileSync(pathFrontend + 'scripts/index.js'))
    } catch (error) {
        console.error("/scripts/index.js : " + error)
        res.status(500)
    }
})

// servers up account_circle.svg
app.get('/img/account_circle.svg', (req, res, next) => {
    try {
        res.status(200).contentType('svg').send(fs.readFileSync(pathFrontend + 'img/account_circle.svg'))
    } catch (error) {
        console.error("/img/account_circle.svg : " + error)
        res.status(500)
    }
})

/* API */
/* /alive */

app.get('/alive', (req, res, next) => {
    res.status(200).json({alive: true})
});

/* /account */

app.get('/account', (req, res, next) => {
    res.status(200).json({message: "Get Account ID Request Received"});
});

app.post('/account', (req, res, next) => {
    // uuid
    // Name
    // Password (plain text for now)

    res.status(201).json({message: "Account Creation Request Received"});
    // return account id
});

/* /account/:accountid */

app.get('/account/:accountid', (req, res, next) => {
    res.status(200).json({message: "Get Account Request Received"});
});

app.put('/account/:accountid', (req, res, next) => {
    // uuid
    // Name
    // Password (plain text for now)

    res.status(201).json({message: "Account Update Request Received"});
});

app.delete('/account/:accountid', (req, res, next) => {
    res.status(200).json({message: "Account Deletion Request Received"});
});

/* /course */

app.post('/course', (req, res, next) => {
    res.status(201).json({message: "Course Creation Request Received"});
    // return course id
});

/* /course/:courseid */

// Send Course ID as query string
app.get('/course/:courseid', (req, res, next) => {
    res.status(200).json({message: "Get Course Request Received"});
});

app.put('/course/:courseid', (req, res, next) => {
    res.status(201).json({message: "Course Creation Request Received"});
});

app.delete('/course/:courseid', (req, res, next) => {
    res.status(200).json({message: "Course Deletion Request Received"});
});

/* /group */

app.post('/group', (req, res, next) => {
    res.status(201).json({message: "Team Creation Request Received"});
    // needs to return group id
});

/* /group/:groupid */

app.get('/group/:groupid', (req, res, next) => {
    res.status(200).json({message: "Get Team Request Received"});
});

app.put('/group/:groupid', (req, res, next) => {
    res.status(201).json({message: "Team Creation Request Received"});
});

app.delete('/group/:groupid', (req, res, next) => {
    res.status(200).json({message: "Team Deletion Request Received"});
});

/* /review */

app.post('/review/:reviewid', (req, res, next) => {
    res.status(201).json({message: "Review Creation Request Received"});
    // return review id
});

/* /review/:reviewid */

app.get('/review/:reviewid', (req, res, next) => {
    res.status(200).json({message: "Get Review Request Received"});
});

app.put('/review/:reviewid', (req, res, next) => {
    res.status(201).json({message: "Review Creation Request Received"});
});

app.delete('/review/:reviewid', (req, res, next) => {
    res.status(200).json({message: "Review Deletion Request Received"});
});

/////////////////////////////////
//        Time to              //
//          LISTEN!!           //
/////////////////////////////////
app.listen(HTTP_PORT, () => {
    console.log("Listening on port: ", HTTP_PORT);
});
