# API Documentation

## Authentication and Session Management

### POST `/session`
**Description**: Create a new session.  
**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
**Response**:
- `201 Created` — Session created, `SESSION_ID` cookie set.
- `401 Unauthorized` — Invalid credentials.

### DELETE `/session`
**Description**: Delete the current session.  
**Requires**: `SESSION_ID` cookie.  
**Response**:
- `205 Reset Content` — Session successfully deleted.
- `401 Unauthorized` — Invalid or missing session.

## User Management

### POST `/user`
**Description**: Create a new user.  
**Request Body**:
```json
{
  "email": "string",
  "passwordHash": "string",
  "firstName": "string",
  "lastName": "string",
  "title": "string",
  "contactInfo": "string"
}
```
**Response**:
- `201 Created` — User created.
- `400 Bad Request` — Missing or invalid fields.

### PUT `/user`
**Description**: Update the current user's information.  
**Requires**: `SESSION_ID` cookie.  
**Request Body**:
```json
{
  "email": "string",
  "newPasswordHash": "string",
  "firstName": "string",
  "lastName": "string",
  "title": "string",
  "contactInfo": "string"
}
```
**Response**:
- `201 Created` — User updated.
- `400 Bad Request` — Missing or invalid fields.
- `401 Unauthorized` — Invalid or missing session.

### GET `/user`
**Description**: Get the current user's information.  
**Requires**: `SESSION_ID` cookie.  
**Response**:
- `200 OK` — User object.
- `401 Unauthorized` — Invalid or missing session.

### GET `/user/byUuid/{userId}`
**Description**: Get user information by user ID.  
**Requires**: `SESSION_ID` cookie.  
**Response**:
- `200 OK` — User object.
- `401 Unauthorized` — Invalid or missing session.

### GET `/user/byEmail/{email}`
**Description**: Get user information by email.  
**Requires**: `SESSION_ID` cookie.  
**Response**:
- `200 OK` — User object.
- `401 Unauthorized` — Invalid or missing session.

### DELETE `/user`
**Description**: Delete the current user account.  
**Requires**: `SESSION_ID` cookie.  
**Request Body**:
```json
{
  "password": "string"
}
```
**Response**:
- `201 Created` — User deleted.
- `400 Bad Request` — Missing or invalid password.
- `401 Unauthorized` — Invalid or missing session.

## Course Management

### POST `/course`
**Description**: Create a new course.  
**Requires**: `SESSION_ID` cookie.  
**Request Body**:
```json
{
  "courseCode": "string",
  "friendlyName": "string"
}
```
**Response**:
- `201 Created` — Returns `{ "courseId": "string" }`.
- `400 Bad Request` — Missing fields.
- `401 Unauthorized` — Invalid or missing session.

### PUT `/course/{courseId}`
**Description**: Update a course.  
**Requires**: `SESSION_ID` cookie.  
**Request Body**:
```json
{
  "courseCode": "string",
  "friendlyName": "string",
  "groupList": ["groupId0", "groupId1"],
  "studentList": ["studentId0", "studentId1"]
}
```
**Response**:
- `201 Created` — Course updated.
- `400 Bad Request` — Missing or invalid fields.
- `401 Unauthorized` — Invalid or missing session.

### GET `/course/{courseId}`
**Description**: Get a course by ID.  
**Requires**: `SESSION_ID` cookie.  
**Response**:
```json
{
  "ownerId": "string",
  "courseCode": "string",
  "friendlyName": "string",
  "groupList": ["groupId0", "groupId1"],
  "studentList": ["studentId0", "studentId1"]
}
```
- `200 OK` — Course object.
- `401 Unauthorized` — Invalid or missing session.

### DELETE `/course/{courseId}`
**Description**: Delete a course.  
**Requires**: `SESSION_ID` cookie.  
**Response**:
- `201 Created` — Course deleted.
- `400 Bad Request` — Missing course ID.
- `401 Unauthorized` — Invalid or missing session.

### POST `/course/{courseId}/student/{studentId}`
**Description**: Add a student to a course.  
**Requires**: `SESSION_ID` cookie.  
**Response**:
- `201 Created` — Student added.
- `400 Bad Request` — Missing parameters.
- `401 Unauthorized` — Invalid or missing session.

### DELETE `/course/{courseId}/student/{studentId}`
**Description**: Remove a student from a course.  
**Requires**: `SESSION_ID` cookie.  
**Response**:
- `201 Created` — Student removed.
- `400 Bad Request` — Missing parameters.
- `401 Unauthorized` — Invalid or missing session.

## Group Management

### POST `/course/{courseId}/group`
**Description**: Create a new group in a course.  
**Requires**: `SESSION_ID` cookie.  
**Response**:
- `201 Created` — Group created.
- `400 Bad Request` — Missing parameters.
- `401 Unauthorized` — Invalid or missing session.

### PUT `/group/{groupId}`
**Description**: Update a group.  
**Requires**: `SESSION_ID` cookie.  
**Response**:
- `201 Created` — Group updated.
- `400 Bad Request` — Missing or invalid fields.
- `401 Unauthorized` — Invalid or missing session.

### GET `/group/{groupId}`
**Description**: Get a group by ID.  
**Requires**: `SESSION_ID` cookie.  
**Response**:
```json
{
  "groupId": "string",
  "groupName": "string",
  "groupMembers": ["studentId0", "studentId1"]
}
```
- `200 OK` — Group object.
- `401 Unauthorized` — Invalid or missing session.

### DELETE `/group/{groupId}`
**Description**: Delete a group.  
**Requires**: `SESSION_ID` cookie.  
**Response**:
- `201 Created` — Group deleted.
- `400 Bad Request` — Missing group ID.
- `401 Unauthorized` — Invalid or missing session.

### POST `/group/{groupId}/student/{studentId}`
**Description**: Add a student to a group.  
**Requires**: `SESSION_ID` cookie.  
**Response**:
- `201 Created` — Student added.
- `400 Bad Request` — Missing parameters.
- `401 Unauthorized` — Invalid or missing session.

### DELETE `/group/{groupId}/student/{studentId}`
**Description**: Remove a student from a group.  
**Requires**: `SESSION_ID` cookie.  
**Response**:
- `201 Created` — Student removed.
- `400 Bad Request` — Missing parameters.
- `401 Unauthorized` — Invalid or missing session.

## Miscellaneous

### GET `/coffee`
**Description**: Joke endpoint.  
**Response**:
- `418 I'm a teapot`
