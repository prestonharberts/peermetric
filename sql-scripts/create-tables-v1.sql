-- Dates are represented as Unix Time, the number of seconds since 1970-01-01 00:00:00 UTC

CREATE TABLE `tblCourses` (
  `CourseID` text NOT NULL,
  `CourseCode` text NOT NULL,
  `CourseName` text NOT NULL,
  `InstructorID` text NOT NULL,
  PRIMARY KEY (`CourseID`)
);

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

CREATE TABLE `tblGroups` (
  `GroupID` text NOT NULL,
  `CourseID` text NOT NULL,
  PRIMARY KEY (`GroupID`),
  FOREIGN KEY (`CourseID`) REFERENCES `tblCourses` (`CourseID`)
);

CREATE TABLE `tblReviewSpecifications` (
  `ReviewSpecID` text NOT NULL,
  `CourseID` text NOT NULL,
  `LiveDate` int NOT NULL,
  `ExpiryDate` int NOT NULL,
  PRIMARY KEY (`ReviewSpecID`),
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
  FOREIGN KEY (`ReviewSpecID`) REFERENCES `tblReviewSpecification` (`ReviewSpecID`)
);

CREATE TABLE `tblSessions` (
  `SessionID` text NOT NULL,
  `UserID` text NOT NULL,
  `ExpiryDate` int NOT NULL,
  PRIMARY KEY (`SessionID`),
  FOREIGN KEY (`UserID`) REFERENCES `tblUsers` (`UserID`)
);


