async function initializeDashboard() {
  try {
    const [resCourses, resGroups, resStudents, resResponses, resUsers] = await Promise.all([
      fetch('http://localhost:1025/courses', { credentials: 'include' }),
      fetch('http://localhost:1025/groups', { credentials: 'include' }),
      fetch('http://localhost:1025/students', { credentials: 'include' }),
      fetch('http://localhost:1025/responses', { credentials: 'include' }),
      fetch('http://localhost:1025/users', { credentials: 'include' })
    ]);

    if (!resCourses.ok || !resGroups.ok || !resStudents.ok || !resResponses.ok || !resUsers.ok) {
      throw new Error('One or more data fetches failed.');
    }

    const rawCourses = await resCourses.json();
    const rawUsers = await resUsers.json();
    groupList = await resGroups.json();
    studentList = await resStudents.json();
    responseList = await resResponses.json();

    courseMap = {};
    for (const course of rawCourses) {
      courseMap[course.CourseID] = {
        courseID: course.CourseID,
        courseCode: course.CourseCode,
        courseName: course.CourseName
      };
    }

    userMap = {};
    for (const user of rawUsers) {
      userMap[user.UserID] = {
        userID: user.UserID,
        firstName: user.FirstName,
        lastName: user.LastName,
        email: user.Email,
        phone: user.Phone,
        bio: user.Bio
      };
    }

    //renderCourseTable();
    renderGroupTable();

  } catch (error) {
    console.error('Error loading dashboard:', error);
    Swal.fire({
      title: 'Error Loading Data',
      text: 'Unable to load course data. Please try again later.',
      icon: 'error'
    });
  }
}

// function renderCourseTable() {
//   const tableBody = document.getElementById('courseList');
//   tableBody.innerHTML = '';

//   for (const course of Object.values(courseMap)) {
//     const courseID = course.courseID;
//     const relatedGroups = groupList.filter(g => g.CourseID === courseID);

//     let totalStudents = 0;
//     let totalReviewsSubmitted = 0;
//     let totalReviewsExpected = 0;

//     for (const group of relatedGroups) {
//       const studentsInGroup = studentList.filter(s => s.GroupID === group.GroupID);
//       const groupSize = studentsInGroup.length;

//       totalStudents += groupSize;
//       totalReviewsExpected += groupSize * (groupSize - 1);
//       totalReviewsSubmitted += responseList.filter(r => r.GroupID === group.GroupID).length;
//     }

//     const submissionRate = totalReviewsExpected > 0
//       ? Math.round((totalReviewsSubmitted / totalReviewsExpected) * 100)
//       : 0;

//     const row = document.createElement('tr');
//     row.innerHTML = `
//       <td><a class="pill-button" href="#">${course.courseCode} - ${course.courseName}</a></td>
//       <td><a class="pill-button" href="#">${totalStudents} student${totalStudents !== 1 ? 's' : ''}</a></td>
//       <td><a class="pill-button" href="#">${totalReviewsSubmitted}/${totalReviewsExpected} submitted (${submissionRate}%)</a></td>
//     `;
//     tableBody.appendChild(row);
//   }
// }

function renderGroupTable() {
  const tableBody = document.getElementById('groupList');
  tableBody.innerHTML = '';

  const groupDataMap = {};

  for (const student of studentList) {
    const groupID = student.GroupID;
    const courseID = student.CourseID;
    const userID = student.UserID;

    if (!groupDataMap[groupID]) {
      groupDataMap[groupID] = {
        courseID,
        members: []
      };
    }

    groupDataMap[groupID].members.push(userID);
  }

  for (const [groupID, groupData] of Object.entries(groupDataMap)) {
    const memberIDs = groupData.members;

    for (const memberID of memberIDs) {
        const user = userMap[memberID];
        const userName = user
            ? `<a class="pill-button" href="#">${user.firstName} ${user.lastName}</a>`
            : memberID;
        const email = user ? user.email : memberID;
        const phone = user ? user.hone : memberID; // Assuming phone is part of the user object
        const bio = user ? user.bio : memberID; // Assuming bio is part of the user object

        const courseInfo = courseMap[groupData.courseID];
        const courseLabel = courseInfo
            ? `${courseInfo.courseCode} - ${courseInfo.courseName}`
            : groupData.courseID;

        const row = document.createElement('tr');
        row.innerHTML = `
          <td><a class="pill-button" href="#">${courseLabel}</a></td>
          <td><a class="pill-button" href="#">${groupID}</a></td>
          <td>${userName}</td>
          <td><a class="pill-button" href="#">${email}</a></td>
          <td><a class="pill-button" href="#">Phone: ${phone}, Discord: ${bio}</a></td>
        `;
        tableBody.appendChild(row);
    }
  }
}

// document.getElementById("formCreateCourse").addEventListener("submit", function (event) {
//   event.preventDefault();

//   const courseID = document.getElementById("CourseID").value.trim();
//   const courseName = document.getElementById("CourseName").value.trim();
//   const studentText = document.getElementById("courseStudents").value.trim();

//   if (!courseID || !courseName) {
//     alert("Please fill in all required fields.");
//     return;
//   }

//   courseMap[courseID] = {
//     courseID: courseID,
//     courseCode: courseID,
//     courseName: courseName
//   };

//   const emailList = studentText.replace(/,/g, " ").split(/\s+/).filter(Boolean);

//   groupList.push({
//     GroupID: "No group",
//     CourseID: courseID
//   });

//   for (const email of emailList) {
//     studentList.push({
//       UserEmail: email,
//       CourseID: courseID,
//       GroupID: "No group"
//     });
//   }

//   this.reset();
//   renderCourseTable();
// });

document.getElementById('txtSearchGroups').addEventListener('input', function () {
  const searchQuery = this.value.toLowerCase();
  const rows = document.querySelectorAll('#taskList tr');

  for (const row of rows) {
    const values = Array.from(row.children).map(cell => cell.textContent.toLowerCase());
    const isVisible = values.some(text => text.includes(searchQuery));
    row.style.display = isVisible ? '' : 'none';
  }
});

// Event listener for the "Leave Group" button
// Copilot assisted
document.getElementById('btnLeaveGroup').addEventListener('click', async () => {
  const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
  const groupId = localStorage.getItem('groupId'); // Assuming groupId is stored in localStorage

  if (!userId || !groupId) {
    Swal.fire({
      title: 'Error!',
      text: 'Unable to identify the user or group.',
      icon: 'error',
      confirmButtonText: 'Close'
    });
    return;
  }

  const confirmation = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to leave this group?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, leave group',
    cancelButtonText: 'Cancel'
  });

  if (confirmation.isConfirmed) {
    try {
      const response = await fetch(`http://localhost:1025/groups/${groupId}/removeUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'You have successfully left the group.',
          icon: 'success',
          confirmButtonText: 'Close'
        }).then(() => {
          // Optionally reload the page or update the UI
          window.location.reload();
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to leave the group.');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'An error occurred while leaving the group.',
        icon: 'error',
        confirmButtonText: 'Close'
      });
    }
  }
});

function populateIncomingSurvey(surveyData) {
  const divInsertSurvey = document.getElementById('divInsertSurvey');

  // Clear any existing content
  divInsertSurvey.innerHTML = '';

  // Create a card for the incoming survey
  const surveyCard = document.createElement('div');
  surveyCard.className = 'card shadow mb-3';

  surveyCard.innerHTML = `
    <div class="card-header bg-primary text-light">
      <b>${surveyData.title}</b>
    </div>
    <div class="card-body">
      <p><strong>Recipient Group:</strong> ${surveyData.recipientGroup}</p>
      <p><strong>Due Date:</strong> ${surveyData.dueDate}</p>
      <p><strong>Faculty Review:</strong> ${surveyData.facultyReview}</p>
      <p><strong>Number of Questions:</strong> ${surveyData.questionCount}</p>
    </div>
  `;

  // Append the survey card to the div
  divInsertSurvey.appendChild(surveyCard);
}

// Example usage: Call this function after creating a survey
// Not fully functional yet. "Cannot read properties of null (reading 'addEventListener') at student.js:279:41"
// Comment this function out to see contents of Group List because this hides them.
// document.getElementById('formAddSurvey').addEventListener('submit', function (event) {
//   event.preventDefault();

//   // Get form values
//   const surveyData = {
//     title: document.getElementById('surveyTitle').value,
//     recipientGroup: document.getElementById('surveyRecipientGroup').value,
//     dueDate: document.getElementById('surveyDueDate').value,
//     facultyReview: document.getElementById('txtFacultyReviewRequirement').value,
//     questionCount: document.getElementById('txtSurveyQuestionCount').value
//   };

//   // Populate the survey in the div
//   populateIncomingSurvey(surveyData);

//   // Optionally, clear the form after submission
//   document.getElementById('formAddSurvey').reset();
// });

// Not fully functional yet, but should populate the "Select Recipient" dropdown with group members.
function populateSurveyRecipientDropdown() {
  const surveyRecipientDropdown = document.getElementById('surveyRecipient');
  surveyRecipientDropdown.innerHTML = '<option value="" selected hidden>Select recipient</option>'; // Clear existing options

  for (const [groupID, groupData] of Object.entries(groupDataMap)) {
    for (const memberID of groupData.members) {
      const user = userMap[memberID];
      if (user) {
        const option = document.createElement('option');
        option.value = memberID;
        option.textContent = `${user.firstName} ${user.lastName} (${groupID})`;
        surveyRecipientDropdown.appendChild(option);
      }
    }
  }
}

// Call this function after the dashboard is initialized
initializeDashboard().then(() => {
  populateSurveyRecipientDropdown();
});
