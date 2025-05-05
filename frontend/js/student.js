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
        bio: user.Bio
      };
    }

    renderCourseTable();
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

function renderCourseTable() {
  const tableBody = document.getElementById('courseList');
  tableBody.innerHTML = '';

  for (const course of Object.values(courseMap)) {
    const courseID = course.courseID;
    const relatedGroups = groupList.filter(g => g.CourseID === courseID);

    let totalStudents = 0;
    let totalReviewsSubmitted = 0;
    let totalReviewsExpected = 0;

    for (const group of relatedGroups) {
      const studentsInGroup = studentList.filter(s => s.GroupID === group.GroupID);
      const groupSize = studentsInGroup.length;

      totalStudents += groupSize;
      totalReviewsExpected += groupSize * (groupSize - 1);
      totalReviewsSubmitted += responseList.filter(r => r.GroupID === group.GroupID).length;
    }

    const submissionRate = totalReviewsExpected > 0
      ? Math.round((totalReviewsSubmitted / totalReviewsExpected) * 100)
      : 0;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><a class="pill-button" href="#">${course.courseCode} - ${course.courseName}</a></td>
      <td><a class="pill-button" href="#">${totalStudents} student${totalStudents !== 1 ? 's' : ''}</a></td>
      <td><a class="pill-button" href="#">${totalReviewsSubmitted}/${totalReviewsExpected} submitted (${submissionRate}%)</a></td>
    `;
    tableBody.appendChild(row);
  }
}

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
          <td><a class="pill-button" href="#">${bio}</a></td>
        `;
        tableBody.appendChild(row);
    }
  }
}

document.getElementById("formCreateCourse").addEventListener("submit", function (event) {
  event.preventDefault();

  const courseID = document.getElementById("CourseID").value.trim();
  const courseName = document.getElementById("CourseName").value.trim();
  const studentText = document.getElementById("courseStudents").value.trim();

  if (!courseID || !courseName) {
    alert("Please fill in all required fields.");
    return;
  }

  courseMap[courseID] = {
    courseID: courseID,
    courseCode: courseID,
    courseName: courseName
  };

  const emailList = studentText.replace(/,/g, " ").split(/\s+/).filter(Boolean);

  groupList.push({
    GroupID: "No group",
    CourseID: courseID
  });

  for (const email of emailList) {
    studentList.push({
      UserEmail: email,
      CourseID: courseID,
      GroupID: "No group"
    });
  }

  this.reset();
  renderCourseTable();
});

document.getElementById('txtSearchGroups').addEventListener('input', function () {
  const searchQuery = this.value.toLowerCase();
  const rows = document.querySelectorAll('#taskList tr');

  for (const row of rows) {
    const values = Array.from(row.children).map(cell => cell.textContent.toLowerCase());
    const isVisible = values.some(text => text.includes(searchQuery));
    row.style.display = isVisible ? '' : 'none';
  }
});

initializeDashboard();
