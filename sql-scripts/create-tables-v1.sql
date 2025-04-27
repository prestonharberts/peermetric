-- Dates are represented as Unix Time, the number of seconds since 1970-01-01 00:00:00 UTC

CREATE TABLE `tblCourses` (
  `CourseID` text NOT NULL,
  `CourseCode` text NOT NULL,
  `CourseName` text NOT NULL,
  `CourseDescription` text,
  PRIMARY KEY (`CourseID`)
);

CREATE TABLE `tblUsers` (
  `Email` text NOT NULL,
  `FirstName` text NOT NULL,
  `LastName` text NOT NULL,
  `MiddleInitial` text,
  `Password` text NOT NULL,
  `PhoneNumber` text,
  `DiscordUsername` text,
  PRIMARY KEY (`Email`)
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
  `UserEmail` text NOT NULL,
  `CourseCode` text NOT NULL,
  `GroupID` text,
  FOREIGN KEY (`UserEmail`) REFERENCES `tblUsers`(`Email`),
  FOREIGN KEY (`CourseCode`) REFERENCES `tblCourses`(`CourseCode`),
  FOREIGN KEY (`GroupID`) REFERENCES `tblGroups` (`GroupID`),
  Primary Key (`UserEmail`, `CourseCode`)
);

CREATE TABLE `tblResponses` (
  `ResponseID` text NOT NULL,
  `ReviewerEmail` text NOT NULL,
  `TargetEmail` text NOT NULL,
  `GroupID` text NOT NULL,
  `ReviewSpecID` text NOT NULL,
  `PublicFeedback` text,
  `PrivateFeedback` text,
  PRIMARY KEY (`ResponseID`),
  FOREIGN KEY (`ReviewerEmail`) REFERENCES `tblUsers` (`Email`),
  FOREIGN KEY (`TargetEmail`) REFERENCES `tblUsers` (`Email`),
  FOREIGN KEY (`GroupID`) REFERENCES `tblGroups` (`GroupID`),
  FOREIGN KEY (`ReviewSpecID`) REFERENCES `tblReviewSpecification` (`ReviewSpecID`)
);

CREATE TABLE `tblSessions` (
  `SessionID` text NOT NULL,
  `UserEmail` text NOT NULL,
  `ExpiryDate` int NOT NULL,
  PRIMARY KEY (`SessionID`),
  FOREIGN KEY (`UserEmail`) REFERENCES `tblUsers` (`Email`)
);


