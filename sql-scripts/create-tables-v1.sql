-- Dates are represented as Unix Time, the number of seconds since 1970-01-01 00:00:00 UTC

<<<<<<< HEAD
CREATE TABLE `tblCourses` (
  `CourseID` text NOT NULL,
  `CourseCode` text NOT NULL,
  `CourseName` text NOT NULL,
  `InstructorID` text NOT NULL,
  PRIMARY KEY (`CourseID`)
);

=======
>>>>>>> endpoints-to-db
CREATE TABLE `tblUsers` (
  `UserID` text NOT NULL,
  `Email` text NOT NULL,
  `FirstName` text NOT NULL,
  `LastName` text NOT NULL,
  `MiddleInitial` text,
  `Password` text NOT NULL,
  `Bio` text,
  PRIMARY KEY (`UserID`)
);

CREATE TABLE `tblCourses` (
  `CourseID` text NOT NULL,
  `CourseCode` text NOT NULL,
  `CourseName` text NOT NULL,
  `OwnerID` text NOT NULL,
  PRIMARY KEY (`CourseID`)
  FOREIGN KEY (`OwnerID`) REFERENCES `tblUsers` (`UserID`)
);

CREATE TABLE `tblGroups` (
  `GroupID` text NOT NULL,
  `CourseID` text NOT NULL,
  PRIMARY KEY (`GroupID`),
  FOREIGN KEY (`CourseID`) REFERENCES `tblCourses` (`CourseID`)
);

CREATE TABLE `tblStudents` (
  `UserID` text NOT NULL,
  `CourseID` text NOT NULL,
  `GroupID` text,
  FOREIGN KEY (`UserID`) REFERENCES `tblUsers`(`UserID`),
  FOREIGN KEY (`CourseID`) REFERENCES `tblCourses`(`CourseID`),
  FOREIGN KEY (`GroupID`) REFERENCES `tblGroups` (`GroupID`),
  Primary Key (`UserID`, `CourseCode`)
);

CREATE TABLE `tblReviewSpecifications` (
  `ReviewSpecID` text NOT NULL,
  `CourseID` text NOT NULL,
  `LiveDate` int NOT NULL,
  `ExpiryDate` int NOT NULL,
  PRIMARY KEY (`ReviewSpecID`),
  FOREIGN KEY (`CourseID`) REFERENCES `tblCourses` (`CourseID`)
);

CREATE TABLE `tblResponses` (
  `ResponseID` text NOT NULL,
  `ReviewerID` text NOT NULL,
  `TargetID` text NOT NULL,
  `GroupID` text NOT NULL,
  `ReviewSpecID` text NOT NULL,
  `PublicFeedback` text,
  `PrivateFeedback` text,
  PRIMARY KEY (`ResponseID`),
  FOREIGN KEY (`ReviewerID`) REFERENCES `tblUsers` (`UserID`),
  FOREIGN KEY (`TargetID`) REFERENCES `tblUsers` (`UserID`),
  FOREIGN KEY (`GroupID`) REFERENCES `tblGroups` (`GroupID`),
  FOREIGN KEY (`ReviewSpecID`) REFERENCES `tblReviewSpecifications` (`ReviewSpecID`)
);

CREATE TABLE `tblSessions` (
  `SessionID` text NOT NULL,
  `UserID` text NOT NULL,
  `ExpiryDate` int NOT NULL,
  PRIMARY KEY (`SessionID`),
  FOREIGN KEY (`UserID`) REFERENCES `tblUsers` (`UserID`)
);


INSERT INTO tblUsers (UserID, Email, FirstName, LastName, MiddleInitial, Password, Bio) VALUES ("7150dbe9-b4cf-472e-a24e-a1743ee1fbc1", "lol@aol.com", "N", "A", "/", "$2b$10$zi/.QOV7zEVKxsnzn93.quIfPBEqBAptH/ewWnWg8bNrpMwrrD0Nu", "lol"); /* Password is 12345678 */
INSERT INTO tblCourses (CourseID, CourseCode, CourseName, OwnerID) VALUES ("b52e0500-58b5-4df3-9f43-d65795abf620", "CS101", "Introduction to Computer Science", "7150dbe9-b4cf-472e-a24e-a1743ee1fbc1");
INSERT INTO tblGroups (GroupID, CourseID) VALUES ("g1h2i3j4-k5l6-m7n8-o9p0-q1r2s3t4u5v6", "b52e0500-58b5-4df3-9f43-d65795abf620");
INSERT INTO tblStudents (UserID, CourseID, GroupID) VALUES ("7150dbe9-b4cf-472e-a24e-a1743ee1fbc1", "b52e0500-58b5-4df3-9f43-d65795abf620", "g1h2i3j4-k5l6-m7n8-o9p0-q1r2s3t4u5v6");
INSERT INTO tblReviewSpecifications (ReviewSpecID, CourseID, LiveDate, ExpiryDate) VALUES ("r1s2t3u4-v5w6-x7y8-z9a0-b1c2d3e4f5g6", "b52e0500-58b5-4df3-9f43-d65795abf620", 0, 9999999999);
INSERT INTO tblResponses (ResponseID, ReviewerID, TargetID, GroupID, ReviewSpecID, PublicFeedback, PrivateFeedback) VALUES ("98f345a8-2ba3-43d6-8281-67bc61cad2f4", "7150dbe9-b4cf-472e-a24e-a1743ee1fbc1", "7150dbe9-b4cf-472e-a24e-a1743ee1fbc1", "g1h2i3j4-k5l6-m7n8-o9p0-q1r2s3t4u5v6", "r1s2t3u4-v5w6-x7y8-z9a0-b1c2d3e4f5g6", "Public feedback", "Private feedback");
INSERT INTO tblSessions (SessionID, UserID, ExpiryDate) VALUES ("session123", "7150dbe9-b4cf-472e-a24e-a1743ee1fbc1", 9999999999);