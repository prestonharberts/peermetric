# API Documentation

This document describes the available endpoints for the Express-based API.

## Authentication

### POST `/session`
**Description:** Create a new session  
**Request Body:**  
- `email`: string  
- `password`: string  

**Sample Request:**
```js
fetch('http://10.143.131.118:1025/session', {
      method: "POST",
      headers: {"Content-Type":"Application/JSON"},
      credentials: "include",
      body: JSON.stringify({email:"lol", password:"lol"})
      }).then(response => {return response.json()}).catch(error => {console.log(error)})
```

**Responses:**  
- `201 Created`: Session created with `SESSION_ID` cookie  
- `401 Unauthorized`: Invalid credentials  

### DELETE `/session`
**Description:** Delete the session  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `205 Reset Content`: Session deleted  
- `401 Unauthorized`: No valid session  

---

## User

### POST `/user`
**Description:** Create a new user  
**Request Body:**  
- `email`, `passwordHash`, `firstName`, `lastName`, `title`, `phoneNumber`, `otherContacts`  

**Responses:**  
- `201 Created`  
- `400 Bad Request`  

### PUT `/user`
**Description:** Update user information  
**Cookie:** `SESSION_ID`  
**Request Body:**  
- `email`, `newPasswordHash`, `firstName`, `lastName`, `title`, `phoneNumber`, `otherContacts`  

**Responses:**  
- `201 Created`  
- `401 Unauthorized`  
- `400 Bad Request`  

### GET `/user`
**Description:** Get current user info  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `200 OK`  
- `401 Unauthorized`  

### GET `/user/byUuid/:userId`
### GET `/user/byEmail/:email`
**Description:** Get user info by ID or email  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `200 OK`  
- `401 Unauthorized`  

### DELETE `/user`
**Description:** Delete the user  
**Cookie:** `SESSION_ID`  
**Request Body:**  
- `password`: string  

**Responses:**  
- `201 Created`  
- `401 Unauthorized`  
- `400 Bad Request`  

---

## Course

### POST `/course`
**Description:** Create a course  
**Cookie:** `SESSION_ID`  
**Request Body:**  
- `courseCode`, `friendlyName`  

**Responses:**  
- `201 Created` (with `courseId`)  
- `401 Unauthorized`  
- `400 Bad Request`  

### PUT `/course/:courseId`
**Description:** Update course info  
**Cookie:** `SESSION_ID`  
**Request Body:**  
- `courseCode`, `friendlyName`, `groupList`, `studentList`  

**Responses:**  
- `201 Created`  
- `401 Unauthorized`  
- `400 Bad Request`  

### GET `/course/:courseId`
**Description:** Get course info  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `200 OK`  
- `401 Unauthorized`  

### DELETE `/course/:courseId`
**Description:** Delete course  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `201 Created`  
- `401 Unauthorized`  
- `400 Bad Request`  

### POST `/course/:courseId/student/:studentId`
### DELETE `/course/:courseId/student/:studentId`
**Description:** Add/remove student from course  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `201 Created`  
- `401 Unauthorized`  
- `400 Bad Request`  

---

## Group

### POST `/course/:courseId/group`
**Description:** Add group to course  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `201 Created` (with `groupId`)  
- `401 Unauthorized`  
- `400 Bad Request`  

### PUT `/group/:groupId`
**Description:** Update group info  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `201 Created`  
- `401 Unauthorized`  
- `400 Bad Request`  

### GET `/group/:groupId`
**Description:** Get group info  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `200 OK`  
- `401 Unauthorized`  

### DELETE `/group/:groupId`
**Description:** Delete group  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `201 Created`  
- `401 Unauthorized`  
- `400 Bad Request`  

### POST `/group/:groupId/student/:studentId`
### DELETE `/group/:groupId/student/:studentId`
**Description:** Add/remove student to/from group  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `201 Created`  
- `401 Unauthorized`  
- `400 Bad Request`  

---

## Review Specification

### POST `/course/:courseId/reviewSpec`
**Description:** Create a review spec  
**Cookie:** `SESSION_ID`  
**Request Body:**  
- `liveDate`, `expiryDate`  

**Responses:**  
- `201 Created` (with `reviewSpecId`)  
- `401 Unauthorized`  
- `400 Bad Request`  

### PUT `/reviewSpec/:reviewSpecId`
**Description:** Update review spec  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `201 Created`  
- `401 Unauthorized`  
- `400 Bad Request`  

### GET `/reviewSpec/:reviewSpecId`
**Description:** Get review spec  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `200 OK`  
- `401 Unauthorized`  

### DELETE `/reviewSpec/:reviewSpecId`
**Description:** Delete review spec  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `201 Created`  
- `401 Unauthorized`  
- `400 Bad Request`  

---

## Review Response

### POST `/group/:groupId/response`
**Description:** Submit review response  
**Cookie:** `SESSION_ID`  
**Request Body:**  
- `reviewSpecId`, `reviewerId`, `targetId`, `publicFeedback`, `privateFeedback`  

**Responses:**  
- `201 Created` (with `responseId`)  
- `401 Unauthorized`  
- `400 Bad Request`  

### GET `/response/:responseId`
**Description:** Get public review response  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `200 OK`  
- `401 Unauthorized`  

### GET `/response/:responseId/private`
**Description:** Get full review response  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `200 OK`  
- `401 Unauthorized`  

### DELETE `/response/:responseId`
**Description:** Delete a review response  
**Cookie:** `SESSION_ID`  
**Responses:**  
- `201 Created`  
- `401 Unauthorized`  
- `400 Bad Request`  

---

## Misc

### GET `/coffee`
**Description:** I'm a teapot  
**Response:**  
- `418 I'm a teapot`

---

**Note:** Most endpoints require the `SESSION_ID` cookie for authentication.
