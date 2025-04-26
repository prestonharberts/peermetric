// index.js
// Goes with content on index.html

// Constants and variables
const strBaseURL = "localhost";
const BackendPort = 8080;

let rowCourseClicked = null

/* Init */
swapToPage('#pageLogin')
// Debug
// swapToPage('#pageDashboard')

/* Navigation Listeners */

// Hide all pages, then you can show just one of them
function swapToPage(strVisiblePage) {
    document.querySelector('#pageNavbar').classList.add('d-none')
    document.querySelectorAll('#pageLogin').forEach((item) => item.classList.add("d-none"))
    document.querySelectorAll('#pageRegister').forEach((item) => item.classList.add("d-none"))
    document.querySelectorAll('#pageDashboard').forEach((item) => item.classList.add("d-none"))
    document.querySelectorAll('#pageCourses').forEach((item) => item.classList.add("d-none"))
    document.querySelectorAll('#pageGroups').forEach((item) => item.classList.add("d-none"))
    document.querySelectorAll('#pageProfile').forEach((item) => item.classList.add("d-none"))
    document.querySelectorAll('#pageCourseEdit').forEach((item) => item.classList.add("d-none"))
    document.querySelectorAll('#pageCourseCreate').forEach((item) => item.classList.add("d-none"))
    document.querySelectorAll('#pageCourseDelete').forEach((item) => item.classList.add("d-none"))
    document.querySelectorAll('#pageGroupDelete').forEach((item) => item.classList.add("d-none"))
    document.querySelector('#pageCreateReview').classList.add("d-none")
    document.querySelector('#pageReviews').classList.add("d-none")
    document.querySelector('#pageGroupEdit').classList.add("d-none")

    document.querySelectorAll(strVisiblePage).forEach((item) => item.classList.remove("d-none"))
    if(strVisiblePage != '#pageLogin' && strVisiblePage != '#pageRegister') {
        document.querySelector('#pageNavbar').classList.remove('d-none')
    }
}

// Sign Out
document.querySelectorAll('#btnSignOut').forEach( (item) => item.addEventListener('click', () => {
    // Remove session information from browser at this time

    swapToPage('#pageLogin')
}) )

// Switch to Registration
document.querySelectorAll('#btnSwitchToRegistration').forEach( (item) => item.addEventListener('click', (event) => {
    swapToPage('#pageRegister')
}) )

// Switch to Login
document.querySelectorAll('#btnSwitchToLogin').forEach( (item) => item.addEventListener('click', (event) => {
    swapToPage('#pageLogin')
}) )

// Switch to Dashboard
document.querySelectorAll('#btnSwitchToDashboard').forEach( (item) => item.addEventListener('click', () => {
    swapToPage('#pageDashboard')
}) )

// Switch to Courses
document.querySelectorAll('#btnSwitchToCourses').forEach( (item) => item.addEventListener('click', () => {
    swapToPage('#pageCourses')
}) )

// Switch to Groups
document.querySelectorAll('#btnSwitchToGroups').forEach( (item) => item.addEventListener('click', () => {
    swapToPage('#pageGroups')
}) )

// Switch to Profile
document.querySelectorAll('#btnSwitchToProfile').forEach( (item) => item.addEventListener('click', () => {
    swapToPage('#pageProfile')
}) )

// Switch to Course Edit
document.querySelectorAll('#btnSwitchToCourseEdit').forEach( (item) => item.addEventListener('click', function (event) {
    rowCourseClicked = this
    swapToPage('#pageCourseEdit')
}))

// Switch to Course Create
document.querySelectorAll('#btnSwitchToCourseCreate').forEach( (item) => item.addEventListener('click', function (event) {
        swapToPage('#pageCourseCreate')
}))

// Switch to Course Delete
document.querySelectorAll('#btnSwitchToCourseDelete').forEach( (item) => item.addEventListener('click', function (event) {
    rowCourseClicked = this
    swapToPage('#pageCourseDelete')
}))

// Swicth to Review Create
document.querySelector('#btnSwitchToReviewCreate').addEventListener('click', () => {
    swapToPage('#pageCreateReview')
})

document.querySelector('#btnSwitchToGroupDelete').addEventListener('click', function (event) {
    swapToPage('#pageGroupDelete')
})

document.querySelector('#btnSwitchToGroupEdit').addEventListener('click', function (event) {
    swapToPage('#pageGroupEdit')
})

document.querySelector('#rngRating').addEventListener('input', () => {
    document.querySelector('#ratingDisplay').innerHTML = `Value: ${document.querySelector('#rngRating').value}`
})

document.querySelector('#btnSwitchToReview').addEventListener('click', () => {
    swapToPage('#pageReviews')
})

// Send change email request
document.querySelector('#btnChangeEmail').addEventListener('click', async () => {
    const { value: strEmail } = await Swal.fire({
        title: "Update email address",
        input: "email",
        inputLabel: "Your new email address",
        inputPlaceholder: "Enter your new email address",
        showCancelButton: true
      });
      if (strEmail) {
        Swal.fire({
            title: `Changed email to: ${strEmail}`,
            icon: "success"
        });
        // Logic to update email goes here:

      } 
})

// Send change password request
document.querySelector('#btnChangePassword').addEventListener('click',  async () => {
    const { value: strPassword } = await Swal.fire({
        title: "Update Password",
        input: "password",
        inputLabel: "Your new password",
        inputPlaceholder: "Enter your new password",
        showCancelButton: true
      });
      if (strPassword) {
        Swal.fire({
            title: `Changed password!`,
            icon: "success"
        });
        // Logic to update password goes here:

      } 
})

/* Validation Listeners */

// Login Validation
document.querySelector('#btnSubmitLogin').addEventListener('click', function() {
    const regEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;

    const strEmail = document.querySelector('#txtLoginEmail').value
    const strPassword = document.querySelector('#txtLoginPassword').value

    // Validate Login info here
    let blnError = false
    let strErrorMessage = ''

    if (!regEmail.test(strEmail))
    {
        blnError = true
        strErrorMessage += "<p>Please enter a valid email.</p>"
    }

    // no whitespace, 8 or longer chars
    if (strPassword.includes(' ') || strPassword.length < 8)
    {
        blnError = true
        strErrorMessage += "<p>Password must be at least 8 characters and contain no whitespaces!</p>"
    }

    if (blnError)
    {
        Swal.fire ({
            title: "You need to review your information!",
            html: strErrorMessage,
            icon: "error"
        })
    }
    else
    {

        swapToPage("#pageDashboard")

        // Swal.fire ({
        //     title: "Success! You have been logged in!",
        //     icon: "success"
        // })
       
        // fetch('http://' + strBaseURL + ':' + BackendPort + '/account' + '?' + strEmail + '&' + strPassword, {
        //     method: 'GET',
        //     headers:
        //     {
        //         'Content-Type': 'application/json'
        //     },
        // })
        // .then(
        //     objResponse => {
        //         return objResponse.json()
        //     }
        // )
        // .then(
        //     objData => {
        //         if (objData.status == 200)
        //         {
        //             // User authenticated! Proceed to dashbard page
        //             // console.log(objData)
        //             // window.location.href="/dashboard.html"
        //             swapToPage('#pageDashboard')
        //         }
        //         else
        //         {
        //             // Swal for invalid creds
        //             Swal.fire ({
        //                 title: "Invalid credentails",
        //                 icon: "error"
        //             })
        //         }
        //     }
        // )
        // .catch(
        //     error => {
        //         // We put error alert here
        //         Swal.fire ({
        //             title: "Error!",
        //             message: error
        //         })
        //     }
        // )


        // If validation goes well (we have a yes) do the rest of the function from here
        
        // POSTs login to backend
        // If response is yes, let the user in the gates
        // If response is no yes, tell them no yes
    }
})


// Registration Validation
document.querySelector('#btnSubmitRegistration').addEventListener('click', function() {
    const regEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;

    const strEmail = document.querySelector('#txtRegistrationEmail').value
    const strEmailConf = document.querySelector('#txtRegistrationConfirmEmail').value
    const strPassword = document.querySelector('#txtRegistrationPassword').value
    const strPasswordConf = document.querySelector('#txtRegistrationConfirmPassword').value

    // Validate Login info here
    let blnError = false
    let strErrorMessage = ''

    if (!regEmail.test(strEmail))
    {
        blnError = true
        strErrorMessage += "<p>Please enter a valid email.</p>"
    }

    // Email and confirmation email must match
    if (strEmail != strEmailConf)
    {
        blnError = true
        strErrorMessage += "<p>Email must match the confirmation email!</p>"
    }

    // no whitespace, 8 or longer chars
    if (strPassword.includes(' ') || strPassword.length < 8)
    {
        blnError = true
        strErrorMessage += "<p>Password must be at least 8 characters and contain no whitespaces!</p>"
    }

    // Password Confirmation is the same as strPassword
    if (strPassword != strPasswordConf)
    {
        blnError = true
        strErrorMessage += "<p>Password field must match password confirmation field!</p>"
    }


    if (blnError)
    {
        Swal.fire ({
            title: "You need to review your information!",
            html: strErrorMessage,
            icon: "error"
        })
    }
    else
    {
        Swal.fire ({
            title: "Success! You have been registered!",
            icon: "success"
        })
        
        // If validation goes well (we have a yes) do the rest of the function from here
        
        // POSTs login to backend
        // If response is yes, add user to the db
        // If response is no yes, tell them no yes
    }
})

// Review Submission Validation
document.querySelector('#btnSubmitReview').addEventListener('click', () => {
    let blnError = false
    strMessage = ''

    const strPubFeedback = document.querySelector('#txtPubFeedback').value
    const strPrivFeedback = document.querySelector('#txtPrivFeedback').value
    const intRating = Number(document.querySelector('#rngRating').value)

    if (strPubFeedback.length < 1)
    {
        blnError = true;
        strMessage += `<p>You <b>must</b> have a Public Feedback!</p>`
    }

    if (intRating < 1 || intRating > 10)
    {
        blnError = true
        strMessage += `<p>Invalid Rating!</p>`
    }

    if (blnError)
    {
        Swal.fire({
            title: "You left me a bad review!",
            html: strMessage,
            icon: "error"
        })
    }
    else
    {
        // HTTP POST goes here


        Swal.fire({
            title: "Review submitted!",
            icon: "success"
        })
    }


})