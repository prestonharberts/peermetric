// ChatGPT generated sample data for testing purposes
// Will be discarded once the backend is fully implemented
const sampleUsers = {
  "johndoe@tntech.edu": {
    password: "Password123",
    firstName: "John",
    middleInitial: "D",
    lastName: "Doe",
    phone: "(123) 456-7890",
    biography: "johndoe#1234"
  },
  "janesmith@tntech.edu": {
    password: "Password123",
    firstName: "Jane",
    middleInitial: "A",
    lastName: "Smith",
    phone: "(987) 654-3210",
    biography: "janesmith#5678"
  },
  "alicebrown@tntech.edu": {
    password: "Password123",
    firstName: "Alice",
    middleInitial: "E",
    lastName: "Brown",
    phone: "(444) 987-6543",
    biography: "alicebrown#3456"
  },
  "bobjohnson@tntech.edu": {
    password: "Password123",
    firstName: "Bobby",
    middleInitial: "C",
    lastName: "Johnson",
    preferredName: "Bob",
    phone: "(555) 123-4567",
    biography: "bobjohnson#9012"
  }
};

const sampleCourses = [
  {
    CourseID: "CSC 1310-001",
    CourseName: "Data Structures and Algorithms",
  },
  {
    CourseID: "CSC 3100-001",
    CourseName: "Web Development",
  }
];

const sampleGroups = [
  { GroupID: "A1", CourseID: "CSC 1310-001" },
  { GroupID: "A2", CourseID: "CSC 3100-001" }
];

const sampleReviewSpecifications = [
  {
    ReviewSpecID: "R1",
    CourseID: "CSC 1310-001",
    LiveDate: 1714348800,   // Apr 29, 2024
    ExpiryDate: 1715039999  // May 7, 2024
  },
  {
    ReviewSpecID: "R2",
    CourseID: "CSC 3100-001",
    LiveDate: 1714435200,   // Apr 30, 2024
    ExpiryDate: 1715126399  // May 8, 2024
  }
];

const sampleStudents = [
  { UserEmail: "johndoe@tntech.edu", CourseID: "CSC 1310-001", GroupID: "A1" },
  { UserEmail: "janesmith@tntech.edu", CourseID: "CSC 1310-001", GroupID: "A1" },
  { UserEmail: "alicebrown@tntech.edu", CourseID: "CSC 3100-001", GroupID: "A2" },
  { UserEmail: "bobjohnson@tntech.edu", CourseID: "CSC 3100-001", GroupID: "A2" }
];

const sampleResponses = [
  {
    ResponseID: "RESP1",
    ReviewerEmail: "johndoe@tntech.edu",
    TargetEmail: "janesmith@tntech.edu",
    GroupID: "A1",
    ReviewSpecID: "R1",
    PublicFeedback: "Jane did a great job collaborating.",
    PrivateFeedback: "Sometimes late to meetings."
  },
  {
    ResponseID: "RESP2",
    ReviewerEmail: "alicebrown@tntech.edu",
    TargetEmail: "bobjohnson@tntech.edu",
    GroupID: "A2",
    ReviewSpecID: "R2",
    PublicFeedback: "Bob was very helpful during coding.",
    PrivateFeedback: "Could communicate more."
  }
];

const sampleSessions = [
  {
    SessionID: "S1",
    UserEmail: "johndoe@tntech.edu",
    ExpiryDate: 1715039999
  },
  {
    SessionID: "S2",
    UserEmail: "alicebrown@tntech.edu",
    ExpiryDate: 1715126399
  }
];

module.exports = {
  sampleUsers,
  sampleCourses,
  sampleGroups,
  sampleReviewSpecifications,
  sampleStudents,
  sampleResponses,
  sampleSessions
};
