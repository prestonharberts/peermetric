// user login authentication
// ChatGPT told me to remove the `event` within the parentheses after `'click', `
document.querySelector('#btnLogin').addEventListener('click', () => {
  let strErrorMessage = ""
  let strErrorRequired = ""

  const regEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

  let strLoginType = document.querySelector("#txtLoginType").value

  let strEmail = document.querySelector("#txtEmailLogin").value
  strEmail = strEmail.toLowerCase()
  if (!document.querySelector("#txtEmailLogin").value) {
    strErrorRequired += "email, "
  }
  else if (!regEmail.test(strEmail)) {
    strErrorMessage += `<p>Please enter a valid email address</p>`
  }

  let strPassword = document.querySelector("#txtPasswordLogin").value
  if (!document.querySelector("#txtPasswordLogin").value) {
    strErrorRequired += "password, "
  }
  strErrorRequired = strErrorRequired.replace(/, $/, "")
  // ChatGPT helped me come up with this regex to replace the last comma with an "and"
  strErrorRequired = strErrorRequired.replace(/,(?=[^,]*$)/, ", and ")

  // ChatGPT helped me come up with this regex to remove a comma if it's the only one
  if ((strErrorRequired.match(/,/g) || []).length === 1) {
    strErrorRequired = strErrorRequired.replace(",", "")
  }

  if (strErrorRequired != '') {
    strErrorRequired = "Please enter into all required fields: " + strErrorRequired
    strErrorMessage += strErrorRequired
  }

  if (strErrorMessage) {
    Swal.fire({
      title: 'Error!',
      html: strErrorMessage,
      icon: 'error',
      confirmButtonText: 'Close'
    })
  }
  else {
    if (sampleUsers[strEmail] && sampleUsers[strEmail].password === strPassword) {
      if (sampleUsers[strEmail].preferredName) {
        localStorage.setItem('userName', sampleUsers[strEmail].preferredName)
      } else {
        localStorage.setItem('userName', sampleUsers[strEmail].name)
      }

      if (strLoginType == 'Student login') {
        window.location.href = 'student.html'
      } else if (strLoginType == 'Faculty login') {
        window.location.href = 'faculty.html'
      }
    } else {
      Swal.fire({
        title: 'Error!',
        html: '<p>Incorrect email or password</p>',
        icon: 'error',
        confirmButtonText: 'Close'
      })
    }
  }
})

// user register authentication
// ChatGPT told me to remove the `event` within the parentheses after `'click', `
document.querySelector('#btnRegister').addEventListener('click', () => {
  let strErrorMessage = ""
  let strErrorRequired = ""

  let strRegisterType = document.querySelector("#txtRegisterType").value

  const regEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  const regPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
  const regMiddleInitial = /^[a-zA-Z]$/
  const regPhone = /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/
  const regDiscord = /^[a-zA-Z0-9_]+#[0-9]{4}$/

  let strEmail = document.querySelector("#txtEmailRegister").value
  strEmail = strEmail.toLowerCase()
  if (!document.querySelector("#txtEmailRegister").value) {
    strErrorRequired += "email, "
  } else if (!regEmail.test(strEmail)) {
    strErrorMessage += `<p>Please enter a valid email address</p>`
  }

  let strPassword = document.querySelector("#txtPasswordRegister").value
  let strPasswordConfirm = document.querySelector("#txtPasswordConfirm").value
  if (!document.querySelector("#txtPasswordRegister").value) {
    strErrorRequired += "password, "
  } else if (!regPassword.test(strPassword)) {
    strErrorMessage += `<p>Please enter a valid password (at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and no special characters)</p>`
  } else if (strPassword !== strPasswordConfirm) {
    strErrorMessage += `<p>Passwords do not match</p>`
  }

  let strFirstName = document.querySelector("#txtFirstName").value
  let strMiddleInitial = document.querySelector("#txtMiddleInitial").value
  let strLastName = document.querySelector("#txtLastName").value
  let strPreferredName = document.querySelector("#txtPreferredName").value
  if (!regMiddleInitial.test(strMiddleInitial) && document.querySelector("#txtMiddleInitial").value) {
    strErrorMessage += `<p>Please enter a valid middle initial</p>`
  }
  if (strPreferredName === strFirstName || strPreferredName === strMiddleInitial || strPreferredName === strLastName) {
    strPreferredName = ""
  }

  let strPhone = document.querySelector("#txtPhone").value
  if (!regPhone.test(strPhone) && document.querySelector("#txtPhone").value) {
    strErrorMessage += `<p>Please enter a valid phone number</p>`
  }

  let strDiscord = document.querySelector("#txtDiscord").value
  if (!regDiscord.test(strDiscord) && document.querySelector("#txtDiscord").value) {
    strErrorMessage += `<p>Please enter a valid discord username (username#0000)</p>`
  }

  if (!document.querySelector("#txtFirstName").value) {
    strErrorRequired += "first name, "
  }

  if (!document.querySelector("#txtLastName").value) {
    strErrorRequired += "last name, "
  }

  strErrorRequired = strErrorRequired.replace(/, $/, "")
  // ChatGPT helped me come up with this regex:
  strErrorRequired = strErrorRequired.replace(/,(?=[^,]*$)/, ", and ")

  // ChatGPT helped me come up with this regex to remove a comma if it's the only one
  if ((strErrorRequired.match(/,/g) || []).length === 1) {
    strErrorRequired = strErrorRequired.replace(",", "")
  }

  if (strErrorRequired != '') {
    strErrorRequired = "Please enter into all required fields: " + strErrorRequired
    strErrorMessage += strErrorRequired
  }

  if (strErrorMessage) {
    Swal.fire({
      title: 'Error!',
      html: strErrorMessage,
      icon: 'error',
      confirmButtonText: 'Close'
    })
  }
  else {
    // Create a new user object
    let newUser = {
      email: strEmail,
      password: strPassword,
      name: strFirstName,
      lastName: strLastName
    }

    // Add optional fields only if they are not empty
    if (strMiddleInitial) {
      newUser.middleInitial = strMiddleInitial
    }
    if (strPreferredName) {
      newUser.preferredName = strPreferredName
    }
    if (strPhone) {
      newUser.phone = strPhone
    }
    if (strDiscord) {
      newUser.discord = strDiscord
    }

    sampleUsers[strEmail] = newUser
    localStorage.setItem('userName', sampleUsers[strEmail].name)


    // Redirect logic
    if (strRegisterType == 'Student account') {
      window.location.href = 'student.html'
    } else if (strRegisterType == 'Faculty account') {
      window.location.href = 'faculty.html'
    }
  }

})

// jQuery
$('#btnSwapLogin').on('click', function () {
  $('#frmLogin').slideUp(function () {
    $('#frmRegister').slideDown()
  })
})

$('#btnSwapRegister').on('click', function () {
  $('#frmRegister').slideUp(function () {
    $('#frmLogin').slideDown()
  })
})