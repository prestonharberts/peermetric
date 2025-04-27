CREATE TABLE `tblCourses` (
  `CourseCode` text,
  `CourseName` text,
  `CourseDescription` text,
  PRIMARY KEY (`CourseCode`)
);

CREATE TABLE `tblUsers` (
  `Email` text,
  `FirstName` text,
  `LastName` text,
  PRIMARY KEY (`Email`)
);

CREATE TABLE `tblOwnedCourses` (
  `UserEmail` text,
  `CourseCode` text,
  FOREIGN KEY (`UserEmail`) REFERENCES `tblUsers`(`Email`),
  FOREIGN KEY (`CourseCode`) REFERENCES `tblCourses` (`CourseCode`),
  PRIMARY KEY (`UserEmail`, `CourseCode`)
);

CREATE TABLE `tblStudents` (
  `UserEmail` text,
  `CourseCode` text,
  FOREIGN KEY (`UserEmail`) REFERENCES `tblUsers`(`Email`),
  FOREIGN KEY (`CourseCode`) REFERENCES `tblCourses`(`CourseCode`),
  Primary Key (`UserEmail`, `CourseCode`)
);