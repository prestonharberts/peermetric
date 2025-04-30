////////////////////////////////
///        PEERMETRIC        ///
/// ------------------------ ///
///      get_requests.js     ///
///        Apr 29, 2025      ///
/// ------------------------ ///
///    Sample get requests   ///
///      to showcase api     ///
////////////////////////////////

// Set global variables for connection info

// Set to SECURE to TRUE if testing with SSL
const SECURE = true;
const REMOTE_SERVER = "peermetric.goose-games.com";
// const REMOTE_SERVER = "localhost";
const REMOTE_PORT = "1025";
var BASE_URL = ""
if (SECURE)
{
    BASE_URL = `https://${REMOTE_SERVER}:${REMOTE_PORT}`;
}
else
{
    BASE_URL = `http://${REMOTE_SERVER}:${REMOTE_PORT}`;
}

// Begin Execution here:

async function MainExecution()
{
    // Test Connection
    TestConnection();
    
    // This function creates a new session for "jdoe@example.com"
    // The ID is returned here and saved in a cookie.
    CreateSession();
    
    // Get User Data
    GetUserData();
}
    
// Prints to console whether connection OK
async function TestConnection()
{
    try
    {
        const response = await fetch(`${BASE_URL}/coffee`, {
            method: "GET",
        });
        // console.log(response);
        if (response.status != 418)
        {
            throw new Error(`Response status: ${response.status}`);
        }
        console.log("Connection OK!");    
    }
    catch (error)
    {
        console.error(error);
    }
}
 

async function CreateSession()
{
    try
    {
        const response = await fetch(`${BASE_URL}/session`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // REQUIRED for browser to store cookie!!
            body: JSON.stringify({
                email: "jdoe@example.com",
                password: "Password123!"
            },),
        });
        return await response;
    }
    catch (error)
    {
        console.error(error.message);
    }
}


async function GetUserData()
{
    console.log("Response: ", await await RequestData("user"));
}

async function RequestData(strRequest)
{
    try
    {
        const response = await fetch(`${BASE_URL}/${strRequest}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        return await response;
    } 
    catch (error)
    {
        console.log(error.message);
    }
}


// It seems I need a frontend so I can use a browser to test cookies :(
document.querySelector('#btnReload').addEventListener('click', () => {
    MainExecution();
});