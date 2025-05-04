// copilot assisted
function populateCourseList(sampleCourses, sampleStudents, sampleGroups, sampleResponses) {
  const courseList = document.getElementById('courseList');
  courseList.innerHTML = ''; // clear existing rows

  // copilot helped create the logic here but I had to change how it all appears
  for (const course of sampleCourses) {
    const courseID = course.CourseID;

    // filter groups for this course
    const groupsForCourse = sampleGroups.filter(g => g.CourseID === courseID);

    let totalStudents = 0;
    let totalSubmitted = 0;
    let totalExpected = 0; // this is here because each student may have to submit multiple reviews per partner

    for (const group of groupsForCourse) {
      const groupStudents = sampleStudents.filter(s => s.CourseID === group.CourseID);
      const n = groupStudents.length;
      totalStudents += n;

      const expected = n * (n - 1); // each student evaluates others
      totalExpected += expected;

      const submitted = sampleResponses.filter(r => r.GroupID === group.GroupID).length;
      totalSubmitted += submitted;
    }

    const percent = totalExpected > 0 ? Math.round((totalSubmitted / totalExpected) * 100) : 0;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><a class=pill-button href="#">${course.CourseID} - ${course.CourseName}</a></td>
      <td><a class=pill-button href="#">${totalStudents} student${totalStudents !== 1 ? 's' : ''}<a href="#"></td>
      <td><a class=pill-button href="#">${totalSubmitted}/${totalExpected} submitted (${percent}%)</a></td>
    `;
    courseList.appendChild(tr);
  }
}

// copilot assisted
function populateGroupList(sampleStudents, sampleUsers, sampleCourses, sampleResponses) {
  const groupList = document.getElementById('groupList');
  groupList.innerHTML = ''; // clear existing rows

  // group students by GroupID
  const groups = {};

  // copilot helped create the logic here but I had to change how it all appears
  for (const student of sampleStudents) {
    const { GroupID, CourseID, UserEmail } = student;
    if (!groups[GroupID]) {
      groups[GroupID] = {
        courseID: CourseID,
        members: []
      };
    }
    const user = sampleUsers[UserEmail.toLowerCase()];
    const fullName = user ? `${user.name} ${user.lastName}` : UserEmail;
    groups[GroupID].members.push(UserEmail); // store email for response matching
  }

  // build table rows
  for (const [groupID, groupData] of Object.entries(groups)) {
    const course = sampleCourses.find(c => c.CourseID === groupData.CourseID);
    const courseLabel = groupData.courseID;
    const memberEmails = groupData.members;
    const studentCount = memberEmails.length;
    const expectedCount = studentCount * (studentCount - 1);

    const submittedCount = sampleResponses.filter(
      r => r.GroupID === groupID
    ).length;

    const percent = expectedCount > 0
      ? Math.round((submittedCount / expectedCount) * 100)
      : 0;

    // human-readable names
    const readableNames = memberEmails.map(email => {
      const user = sampleUsers[email.toLowerCase()];
      return user ? `<a class=pill-button href="#">${user.name} ${user.lastName}</a>` : email;
    }).join(' ');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><a class=pill-button href="#">${courseLabel}</a></td>
      <td><a class=pill-button href="#">${groupID}</a></td>
      <td>${readableNames}</td>
      <td><a class=pill-button href="#">${submittedCount}/${expectedCount} submitted (${percent}%)</a></td>
    `;
    groupList.appendChild(tr);
  }
}

document.getElementById("formCreateCourse").addEventListener("submit", function (e) {
  e.preventDefault(); // prevent actual form submission

  const courseID = document.getElementById("courseID").value.trim();
  const courseName = document.getElementById("courseName").value.trim();
  const studentText = document.getElementById("courseStudents").value.trim();
  const semester = document.getElementById("courseSemester").value;

  // Optional: handle blank fields
  if (!courseID || !courseName || !semester) {
    alert("Please fill in all required fields.");
    return;
  }

  // Add course to course array
  sampleCourses.push({
    CourseID: courseID,
    CourseName: courseName,
  });

  // Parse and sanitize student emails
  const cleaned = studentText.replace(/,/g, " "); // remove commas
  const emails = cleaned.split(/\s+/).filter(email => email); // split on whitespace

  for (const email of emails) {
    sampleStudents.push({
      UserEmail: email,
      CourseID: courseID,
      GroupID: ""
    });
  }
  console.log(sampleStudents)

  // Optionally clear form
  this.reset();

  populateCourseList(sampleCourses, sampleStudents, sampleGroups, sampleResponses)
});

document.getElementById('txtSearchGroups').addEventListener('input', function () {
  const query = this.value.toLowerCase()
  const rows = document.querySelectorAll('#taskList tr')

  rows.forEach(row => {
    const course = row.children[0].textContent.toLowerCase()
    const group = row.children[1].textContent.toLowerCase()
    const members = row.children[2].textContent.toLocaleLowerCase()
    const evals = row.children[3].textContent.toLowerCase()

    const match = course.includes(query) || group.includes(query) || members.includes(query) || evals.includes(query)
    row.style.display = match ? '' : 'none'
  })
})
