// comments were assisted by copilot

// get the current user ID from local storage
// this retrieves the user ID of the currently logged-in user from the browser's local storage.
// it is assumed that the user ID was stored during the login process.
const currentUserId = localStorage.getItem('userId')

// these maps store course and user data for quick lookup
// `courseMap` is used to store course information, where the key is the course UUID.
// `userMap` is used to store user information, where the key is the user UUID.
let courseMap = {} // maps course UUIDs to course info
let userMap = {}   // maps user UUIDs to user info

// loads all necessary data and initializes the dashboard
// this function fetches data from multiple API endpoints, processes the data, and renders the dashboard.
async function initializeDashboard() {
  try {
    // fetch all datasets in parallel using Promise.all for better performance.
    // each fetch call retrieves data from a specific API endpoint.
    const [resCourses, resGroups, resStudents, resResponses, resUsers] = await Promise.all([
      fetch('http://localhost:1025/courses', { credentials: 'include' }), // fetches course data
      fetch('http://localhost:1025/groups', { credentials: 'include' }),  // fetches group data
      fetch('http://localhost:1025/students', { credentials: 'include' }), // fetches student data
      fetch('http://localhost:1025/responses', { credentials: 'include' }), // fetches response data
      fetch('http://localhost:1025/users', { credentials: 'include' }) // fetches user data
    ])

    // ensure all fetches succeeded by checking the `ok` property of each response.
    // if any fetch fails, an error is thrown.
    if (!resCourses.ok || !resGroups.ok || !resStudents.ok || !resResponses.ok || !resUsers.ok) {
      throw new Error('One or more data fetches failed.')
    }

    // parse the JSON responses from the API calls.
    // these variables will hold the raw data returned by the API.
    const rawCourses = await resCourses.json()
    const rawUsers = await resUsers.json()
    groupList = await resGroups.json()
    studentList = await resStudents.json()
    responseList = await resResponses.json()

    // map course UUIDs to course data for quick lookup.
    // this creates a dictionary where each course UUID is associated with its details.
    for (const course of rawCourses) {
      courseMap[course.CourseID] = {
        courseID: course.CourseID,
        courseCode: course.CourseCode,
        courseName: course.CourseName
      }
    }

    // map user UUIDs to user data for quick lookup.
    // this creates a dictionary where each user UUID is associated with their details.
    for (const user of rawUsers) {
      userMap[user.UserID] = {
        userID: user.UserID,
        firstName: user.FirstName,
        lastName: user.LastName,
        userEmail: user.Email
      }
    }

    // render the course and group summaries on the dashboard.
    // these functions update the HTML tables with the fetched data.
    renderCourseTable()
    renderGroupTable()

  } catch (error) {
    // if an error occurs during data fetching or processing, log the error to the console.
    console.error('Error loading dashboard:', error)

    // display an error message to the user using SweetAlert.
    // the user is prompted to log back in.
    Swal.fire({
      title: 'Error Loading Data',
      text: 'Unable to load data. Please log back in.',
      icon: 'error',
      confirmButtonText: 'Log Out'
    }).then(() => {
      // redirect the user to the login page.
      window.location.href = 'index.html'
    })
  }
}

// render course summary table showing overall student and review counts
// this function dynamically generates rows for the course summary table based on the data in `courseMap`.
function renderCourseTable() {
  // get the table body element where the rows will be added.
  const tableBody = document.getElementById('courseList')
  tableBody.innerHTML = '' // clear any existing rows in the table.

  // loop through each course in the `courseMap`.
  for (const course of Object.values(courseMap)) {
    const courseID = course.courseID // the unique ID of the course.
    const relatedGroups = groupList.filter(group => group.CourseID === courseID) // groups associated with this course.

    // initialize counters for students and reviews.
    let totalStudents = 0
    let totalReviewsSubmitted = 0
    let totalReviewsExpected = 0

    // loop through each group in the course to calculate statistics.
    for (const group of relatedGroups) {
      const studentsInGroup = studentList.filter(student => student.GroupID === group.GroupID) // students in the group.
      const groupSize = studentsInGroup.length // number of students in the group.

      totalStudents += groupSize // add the group size to the total student count.
      totalReviewsExpected += groupSize * (groupSize - 1) // calculate the total expected reviews.
      totalReviewsSubmitted += responseList.filter(resp => resp.GroupID === group.GroupID).length // count submitted reviews.
    }

    // calculate the submission rate as a percentage.
    const submissionRate = totalReviewsExpected > 0
      ? Math.round((totalReviewsSubmitted / totalReviewsExpected) * 100)
      : 0

    // create a new table row for the course.
    const row = document.createElement('tr')
    row.innerHTML = `
      <td><a class="pill-button" href="#">${course.courseCode} - ${course.courseName}</a></td>
      <td><a class="pill-button" href="#">${totalStudents} student${totalStudents !== 1 ? 's' : ''}</a></td>
      <td><a class="pill-button" href="#">${totalReviewsSubmitted}/${totalReviewsExpected} submitted (${submissionRate}%)</a></td>
    `
    tableBody.appendChild(row) // add the row to the table body.
  }
}

// render group-level table showing individual group stats and members
function renderGroupTable() {
  const tableBody = document.getElementById('groupList')
  tableBody.innerHTML = ''

  const groupDataMap = {} // composite-keyed object for deduplication

  // step 1: Initialize all groups from groupList
  for (const group of groupList) {
    const courseID = group.CourseID
    const groupID = group.GroupID
    const groupKey = `${courseID}|${groupID}`

    groupDataMap[groupKey] = {
      courseID,
      groupID,
      members: []
    }
  }

  // step 2: Add student members to those groups
  for (const student of studentList) {
    const courseID = student.CourseID
    const groupID = student.GroupID
    const userID = student.UserID
    const groupKey = `${courseID}|${groupID}`

    if (!groupDataMap[groupKey]) {
      // fallback in case group is missing in groupList
      groupDataMap[groupKey] = {
        courseID,
        groupID,
        members: []
      }
    }

    groupDataMap[groupKey].members.push(userID)
  }

  for (const groupData of Object.values(groupDataMap)) {
    const { courseID, groupID, members } = groupData
    const studentCount = members.length
    const expectedReviews = studentCount * (studentCount - 1)
    const actualReviews = responseList.filter(resp => resp.GroupID === groupID).length
    const completionRate = expectedReviews > 0
      ? Math.round((actualReviews / expectedReviews) * 100)
      : 0

    const courseInfo = courseMap[courseID]
    const courseLabel = courseInfo
      ? `${courseInfo.courseCode} - ${courseInfo.courseName}`
      : courseID

    const isDefaultGroup = groupID === courseID
    const groupLabel = isDefaultGroup
      ? `<span class="text-muted">No group</span>`
      : `<a class="pill-button" href="#">${groupID}</a>`

    const readableNames = members.map(userID => {
      const user = userMap[userID]
      return user
        ? `<a class="pill-button" href="#">${user.firstName} ${user.lastName}</a>`
        : userID
    }).join(' ')

    const row = document.createElement('tr')
    row.innerHTML = `
      <td><a class="pill-button" href="#">${courseLabel}</a></td>
      <td>${groupLabel}</td>
      <td>${readableNames}</td>
      <td><a class="pill-button" href="#">${actualReviews}/${expectedReviews} submitted (${completionRate}%)</a></td>
    `
    tableBody.appendChild(row)
  }
}

// handle form submission to create a new course and assign students
// uses userMap to validate emails and adds students to default "No group"
document.getElementById("formCreateCourse").addEventListener("submit", async function(event) {
  event.preventDefault()

  const inputCourseCode = document.getElementById("CourseID").value.trim()
  const inputCourseName = document.getElementById("CourseName").value.trim()
  const studentTextArea = document.getElementById("courseStudents").value.trim()

  if (!inputCourseCode || !inputCourseName) {
    Swal.fire({
      title: 'Please fill in all required fields.',
      icon: 'error',
      confirmButtonText: 'Close'
    })
    return
  }

  try {
    const response = await fetch("http://localhost:1025/course", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseCode: inputCourseCode,
        courseName: inputCourseName
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status} — ${errorText}`)
    }

    const result = await response.json()
    const newCourseID = result.courseId

    courseMap[newCourseID] = {
      courseCode: inputCourseCode,
      courseName: inputCourseName
    }

    const defaultGroupID = 'No group'
    groupList.push({ GroupID: defaultGroupID, CourseID: newCourseID })

    const emailList = studentTextArea.replace(/,/g, " ").split(/\s+/).filter(Boolean)
    const addStudentPromises = []

    for (const email of emailList) {
      let matchingUser = Object.values(userMap).find(
        user => user.userEmail?.toLowerCase() === email.toLowerCase()
      )

      if (!matchingUser) {
        try {
          const res = await fetch(`http://localhost:1025/user/byEmail/${encodeURIComponent(email)}`, {
            credentials: 'include'
          })

          if (res.ok) {
            const userData = await res.json()
            matchingUser = {
              userID: userData.userID,
              userEmail: userData.Email,
              firstName: userData.firstName,
              lastName: userData.lastName
            }

            userMap[matchingUser.userID] = matchingUser
          } else {
            console.warn(`User not found in backend for email: ${email}`)
            continue
          }
        } catch (err) {
          console.error(`Error checking user by email ${email}:`, err)
          continue
        }
      }


      const studentID = matchingUser.userID

      const promise = fetch(`http://localhost:1025/course/${newCourseID}/student/${studentID}`, {
        method: "POST",
        credentials: "include"
      }).then(res => {
        if (res.ok) {
          studentList.push({
            UserID: studentID,
            UserEmail: email,
            CourseID: newCourseID,
            GroupID: defaultGroupID
          })
        } else {
          console.error(`Failed to add student ${studentID} to course ${newCourseID}`)
        }
      }).catch(err => {
        console.error(`Network error while adding student ${studentID}:`, err)
      })

      addStudentPromises.push(promise)
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
    await Promise.allSettled(addStudentPromises)
  } catch (error) {
    console.error("Failed to create course:", error)
    Swal.fire({
      title: 'Course Creation Failed',
      text: error.message,
      icon: 'error',
      confirmButtonText: 'Close'
    })
  }
  renderCourseTable()
  renderGroupTable()

})

// live search for group table rows by keyword input
// this function filters the rows in the group table based on the user's search query.
document.getElementById('txtSearchGroups').addEventListener('input', function() {
  const searchQuery = this.value.toLowerCase() // convert the search query to lowercase for case-insensitive matching.
  const rows = document.querySelectorAll('#taskList tr') // get all rows in the group table.

  // loop through each row and check if it matches the search query.
  for (const row of rows) {
    const values = Array.from(row.children).map(cell => cell.textContent.toLowerCase()) // get the text content of each cell in the row.
    const isVisible = values.some(text => text.includes(searchQuery)) // check if any cell contains the search query.
    row.style.display = isVisible ? '' : 'none' // show or hide the row based on the match.
  }
})

// starts dashboard loading on page load
// this function is called when the page loads to initialize the dashboard.
initializeDashboard()
