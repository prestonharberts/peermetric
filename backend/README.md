Note: This reference document was produced by ChatGPT from the file api.js, which includes plentiful documentation. Most of this should be correct; however, AI can make mistakes. When in doubt, please check api.js, where you can find accurate documentation in the comments above each endpoint.
# API Endpoint Documentation

This document outlines the available RESTful API endpoints, including their methods, paths, and general usage.

## Endpoints

### `DELETE /course/:courseId`

- **Method**: `DELETE`
- **Path**: `/course/:courseId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `DELETE /course/:courseId/student/:studentId`

- **Method**: `DELETE`
- **Path**: `/course/:courseId/student/:studentId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `DELETE /group/:groupId`

- **Method**: `DELETE`
- **Path**: `/group/:groupId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `DELETE /group/:groupId/student/:studentId`

- **Method**: `DELETE`
- **Path**: `/group/:groupId/student/:studentId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `DELETE /response/:responseId`

- **Method**: `DELETE`
- **Path**: `/response/:responseId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `DELETE /reviewSpec/:reviewSpecId`

- **Method**: `DELETE`
- **Path**: `/reviewSpec/:reviewSpecId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `DELETE /session`

- **Method**: `DELETE`
- **Path**: `/session`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `DELETE /user`

- **Method**: `DELETE`
- **Path**: `/user`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `DELETE /user/byEmail/:email`

- **Method**: `DELETE`
- **Path**: `/user/byEmail/:email`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `GET /ad`

- **Method**: `GET`
- **Path**: `/ad`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `GET /coffee`

- **Method**: `GET`
- **Path**: `/coffee`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `GET /course/:courseId`

- **Method**: `GET`
- **Path**: `/course/:courseId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `GET /courses`

- **Method**: `GET`
- **Path**: `/courses`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `GET /group/:groupId`

- **Method**: `GET`
- **Path**: `/group/:groupId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `GET /group/:groupId/responses`

- **Method**: `GET`
- **Path**: `/group/:groupId/responses`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `GET /groups`

- **Method**: `GET`
- **Path**: `/groups`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `GET /response/:responseId`

- **Method**: `GET`
- **Path**: `/response/:responseId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `GET /response/:responseId/private`

- **Method**: `GET`
- **Path**: `/response/:responseId/private`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `GET /responses`

- **Method**: `GET`
- **Path**: `/responses`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `GET /reviewSpec/:reviewSpecId`

- **Method**: `GET`
- **Path**: `/reviewSpec/:reviewSpecId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `GET /session`

- **Method**: `GET`
- **Path**: `/session`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `GET /user`

- **Method**: `GET`
- **Path**: `/user`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `GET /user/byEmail/:email`

- **Method**: `GET`
- **Path**: `/user/byEmail/:email`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `GET /user/byUuid/:userId`

- **Method**: `GET`
- **Path**: `/user/byUuid/:userId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `GET /users`

- **Method**: `GET`
- **Path**: `/users`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `POST /course`

- **Method**: `POST`
- **Path**: `/course`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `POST /course/:courseId/group`

- **Method**: `POST`
- **Path**: `/course/:courseId/group`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `POST /course/:courseId/reviewSpec`

- **Method**: `POST`
- **Path**: `/course/:courseId/reviewSpec`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `POST /course/:courseId/student/:studentId`

- **Method**: `POST`
- **Path**: `/course/:courseId/student/:studentId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `POST /group/:groupId/response/:reviewSpecId`

- **Method**: `POST`
- **Path**: `/group/:groupId/response/:reviewSpecId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `POST /group/:groupId/student/:studentId`

- **Method**: `POST`
- **Path**: `/group/:groupId/student/:studentId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `POST /session`

- **Method**: `POST`
- **Path**: `/session`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `POST /user`

- **Method**: `POST`
- **Path**: `/user`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `PUT /course/:courseId`

- **Method**: `PUT`
- **Path**: `/course/:courseId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `PUT /group/:groupId`

- **Method**: `PUT`
- **Path**: `/group/:groupId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `PUT /reviewSpec/:reviewSpecId`

- **Method**: `PUT`
- **Path**: `/reviewSpec/:reviewSpecId`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._

### `PUT /user`

- **Method**: `PUT`
- **Path**: `/user`
- **Description**: _TODO: Add description._
- **Request Parameters**: _TODO: Add parameters._
- **Response**: _TODO: Describe response._
