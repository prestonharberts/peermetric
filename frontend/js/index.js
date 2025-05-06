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
    // Now create a new session
    return fetch('http://localhost:1025/session', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: strEmail,
        password: strPassword
      })
    })
      .then(response => {
        if (response.status === 201) {
          // Session created; now fetch user info
          return fetch('http://localhost:1025/user', {
            method: 'GET',
            credentials: 'include'
          });
        } else if (response.status === 401) {
          throw new Error('Unauthorized');
        } else {
          throw new Error('Unexpected server response');
        }
      })
      .then(response => {
        if (!response.ok) throw new Error('Failed to load user info');
        return response.json();
      })
      .then(user => {
        // Use preferred name if available, otherwise fall back to first name
        console.log(user)
        // const displayName = user.preferredName || user.firstName;
        const displayName = user.firstName;
        localStorage.setItem('userName', displayName);
        localStorage.setItem('userEmail', user.Email);
        localStorage.setItem('userId', user.userID);

        if (strLoginType === 'Student login') {
          window.location.href = 'student.html';
        } else if (strLoginType === 'Faculty login') {
          window.location.href = 'faculty.html';
        }
      })
      .catch(error => {
        console.error('Login error:', error);
        Swal.fire({
          title: 'Login Failed',
          html: '<p>Incorrect email or password</p>',
          icon: 'error',
          confirmButtonText: 'Close'
        });
      });
  }
})

// user register authentication
// ChatGPT told me to remove the `event` within the parentheses after `'click', `
document.querySelector('#btnRegister').addEventListener('click', async () => {

  let strErrorMessage = ""

  // let strRegisterType = document.querySelector("#txtRegisterType").value

  const regEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  const regPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/



  let strEmail = document.querySelector("#txtEmailRegister").value.toLowerCase().trim()
  let strPassword = document.querySelector("#txtPasswordRegister").value
  let strPasswordConfirm = document.querySelector("#txtPasswordConfirm").value
  let strFirstName = document.querySelector("#txtFirstName").value
  // let strMiddleInitial = document.querySelector("#txtMiddleInitial").value
  let strLastName = document.querySelector("#txtLastName").value

  let strBio = document.querySelector('#txtBio').value

  let blnError = false
  let strErrMessage = ""

  if (!regEmail.test(strEmail)) {
    blnError = true
    strErrorMessage += "<p>Invalid Email!</p>"
  }
   
  if (!regPassword.test(strPassword)) {
    blnError = true
    strErrorMessage += "<p>Invalid Password (at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and no special characters)</p>"


  if (strPassword != strPasswordConfirm)
  {
    blnError = true
    strErrorMessage += "<p>Passwords do not match!</p>"
  }

  if (!strBio) {
    blnError = true
    strErrorMessage += `<p>Please enter a Bio</p>`
  }

  if (!strFirstName) {
    blnError = true
    strErrorMessage += "<p>Invalid First Name!</p>"
  }

  if (!strLastName) {
    blnError = true
    strErrorMessage += "<p>Invalid Last Name!</p>"
  }

  if (strMiddleInitial.length != 1) {
    blnError = true
    strErrorMessage += "<p>Invalid Initial! (Must be 1 character)</p>"
  }

  // ChatGPT helped me come up with this regex:
  // strErrorRequired = strErrorRequired.replace(/,(?=[^,]*$)/, ", and ")

  // ChatGPT helped me come up with this regex to remove a comma if it's the only one
  // if ((strErrorRequired.match(/,/g) || []).length === 1) {
  //   strErrorRequired = strErrorRequired.replace(",", "")
  // }

  // if (strErrorRequired != '') {
  //   strErrorRequired = "Please enter into all required fields: " + strErrorRequired
  //   strErrorMessage += strErrorRequired
  // }

  if (blnError) {
    Swal.fire({
      title: 'Error!',
      html: strErrorMessage,
      icon: 'error',
      confirmButtonText: 'Close'
    })
  }
  else {
    localStorage.setItem('userName', strFirstName)


    try
    {
      const objResponse = await fetch('http://localhost:1025/user', {
        method: "POST",
        headers: {
          "Content-Type": "Application/JSON"
        },
        credentials: "include",
        body: JSON.stringify({
          email: strEmail,
          password: strPassword,
          firstName: strFirstName,
          lastName: strLastName,
          middleInitial: strMiddleInitial,
          bio: strBio
        })
      })
      
      if (await objResponse.ok)
        {
          Login(strEmail, strPassword)
        }
        else
        {
          Swal.fire
          ({
            title: "Error!",
            text: "Could not register new user!",
            icon: 'error'
          })
        }
      }
      catch (err)
      {
        console.error(err.message)
      }

    }
})

// Login if successful
async function Login(strEmail, strPassword)
{
  // Make a new session
  objResponse = await fetch('http://localhost:1025/session', {
    method: "POST",
    headers: {
      "Content-Type": "Application/JSON"
    },
    body: JSON.stringify({
      "email": strEmail,
      "password": strPassword
    })
  })
  // Change page to dashboard based on currently selected role
  if (await objResponse.ok)
  {
    const strRegisterType = document.querySelector("#txtRegisterType").value
    // Redirect logic
    if (strRegisterType == 'Student account') {
      window.location.href = 'student.html'
    } else if (strRegisterType == 'Faculty account') {
      window.location.href = 'faculty.html'
    }
  }
  else
  {
    Swal.fire({
      title: "Error!",
      text: "Could not log in!",
      icon: "error"
    })
  }
}

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