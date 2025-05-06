// const currentUserId = localStorage.getItem('userId');

let courseMap = {};
let userMap = {};

async function initializeDashboard() {
  try {
    const [resCourses, resGroups, resStudents, resResponses, resUsers, resUser] = await Promise.all([
      fetch('http://localhost:1025/courses', { credentials: 'include' }),
      fetch('http://localhost:1025/groups', { credentials: 'include' }),
      fetch('http://localhost:1025/students', { credentials: 'include' }),
      fetch('http://localhost:1025/responses', { credentials: 'include' }),
      fetch('http://localhost:1025/users', { credentials: 'include' }),
      fetch('http://localhost:1025/user', { credentials: 'include' }),
    ]);

    if (!resCourses.ok || !resGroups.ok || !resStudents.ok || !resResponses.ok || !resUsers.ok || !resUser.ok) {
      throw new Error('One or more data fetches failed.');
    }

    const rawCourses = await resCourses.json();
    const rawUsers = await resUsers.json();
    const currentUser = await resUser.json();
    const currentUserID = currentUser.userID;

    groupList = await resGroups.json();
    studentList = await resStudents.json();
    responseList = await resResponses.json();

    for (const course of rawCourses) {
      // if (course.InstructorID === currentUserId) {
      courseMap[course.CourseID] = {
        courseID: course.CourseID,
        courseCode: course.CourseCode,
        courseName: course.CourseName
        // }
      }
    }

    for (const user of rawUsers) {
      userMap[user.UserID] = {
        userID: user.UserID,
        firstName: user.FirstName,
        lastName: user.LastName
      };
    }

    renderCourseTable();
    renderGroupTable();
    FillResponses(await currentUser)

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
    // if (!courseMap[groupData.courseID]) continue;

    const memberIDs = groupData.members;
    const studentCount = memberIDs.length;
    const expectedReviews = studentCount * (studentCount - 1);
    const actualReviews = responseList.filter(r => r.GroupID === groupID).length;
    const completionRate = expectedReviews > 0
      ? Math.round((actualReviews / expectedReviews) * 100)
      : 0;

    const courseInfo = courseMap[groupData.courseID];
    const courseLabel = courseInfo
      ? `${courseInfo.courseCode} - ${courseInfo.courseName}`
      : groupData.courseID;

    const readableNames = memberIDs.map(id => {
      const user = userMap[id];
      return user
        ? `<a class="pill-button" href="#">${user.firstName} ${user.lastName}</a>`
        : id;
    }).join(' ');

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><a class="pill-button" href="#">${courseLabel}</a></td>
      <td><a class="pill-button" href="#">${groupID}</a></td>
      <td>${readableNames}</td>
      <td><a class="pill-button" href="#">${actualReviews}/${expectedReviews} submitted (${completionRate}%)</a></td>
    `;
    tableBody.appendChild(row);

  }
}

async function FillResponses(objUser)
{
    // Get responses
    // resResponses = await fetch(`http://localhost:1025/responses`, {
    //     method: "GET",
    //     credentials: "include"
    // })
    // if (!resResponses.ok)
    // {
    //     Swal.fire({
    //         icon: "error",
    //         title: "Error Loading Responses"
    //     })
    // }
    // else
    // {
    //     objResponses = await resResponses.json();
    //     console.log(objResponses)

    //     // Get entire responses
    //     arrTargets = []
    //     for (let intIterator = 0; intIterator < objResponses.length; intIterator++)
    //     {
    //         let resResponseFull = await fetch(`http://localhost:1025/response/${objResponses[intIterator].ResponseID}`, {
    //             credentials: "include"
    //         })
    //         if (!resResponseFull.ok)
    //         {
    //             Swal.fire({
    //                 icon: "error",
    //                 title: "Error Loading!"
    //             })
    //         }
    //         else
    //         {
    //             let objTarget;
    //             // Get target names
    //             resTarget = await fetch(`http://localhost:1025/user/byUuid/${await resResponseFull.TargetID}`, {
    //                 credentials: "include"              
    //             })
    //             if (!resTarget.ok)
    //             {
    //                 Swal.fire({
    //                     icon: "error",
    //                     title: "Error Loading!"
    //                 })
    //             }
    //             else
    //             {
    //                 arrTargets.push(await `${resTarget.FirstName} ${resTarget.LastName}`)
    //                 objTarget = await resTarget.json();
    //             }
    //         }
    //     }
    // }
    // console.log(arrTargets)


    resResponses = await fetch(`http://localhost:1025/responses`, {
        method: "GET",
        credentials: "include"
    })
    if (!resResponses.ok)
    {
        Swal.fire({
            icon: "error",
            title: "Error Loading Responses"
        })
    }
    else
    {
        const objResponses = await resResponses.json()
        // console.log(objResponses)
        for (let intIterator = 0; intIterator < objResponses.length; intIterator++)
        {
            document.querySelector('#putFormsHere').innerHTML += 
            `
            <div id=\"${objResponses[intIterator].courseID}${objResponses[intIterator].groupID}${objResponses[intIterator].targetID}\" class=\"form form-control\">
                <h3 class="card-title">${objUser.firstName} ${objUser.lastName}</h3>
                <textarea class="form-control" placeholder="Feedback"></textarea>
                <textarea class="form-control" placeholder="Feedback (Private)"></textarea>
            </div>
            `
        }
    }

}



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
