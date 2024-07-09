const csrftoken = getCookie('csrftoken');
const token = localStorage.getItem('AdminLoginToken');
const baseUrl = window.location.origin;

//Dont open page if there is no token
if (!token) {
    window.location.href = "/login/";
}else{
    getUserDetails()
    spinner(0)
}

// Fetch all stations and display them (used when adding new bus)
document.addEventListener('DOMContentLoaded', function() {
    fetch(`${baseUrl}/api/stations/`)
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('depo');
            data.forEach(station => {
                const option = document.createElement('option');
                option.value = station.id;
                option.textContent = station.stationName;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching stations:', error));
});

// Main Function
$(document).ready(function () {  
    
    // Add User Form
    $("#addUser").submit(function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Get form data
        var formData = $(this).serialize();
        var params = new URLSearchParams(formData);
        const role = params.get('userRole');
        spinner(1)
        //Send the data to the server using AJAX
        $.ajax({
            type: "POST", // You can change the HTTP method to match your server-side handling
            url: `${baseUrl}/api/users/`,
            data: formData,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function (response) {
                spinner(0)
                if (response['message'] == "User created successfully"){
                   var userid = response['data']['id']
                   createUser(role,userid)
                }
            },
            error: function (xhr, status, error) {
                spinner(0)
                // Handle errors (e.g., show an error message)
                console.log("Error: " + error);
                console.log("Status: " + status);
                console.log("Response: " + xhr.responseText);
            
                // Check the response text for a specific error message
                try {
                    var response = JSON.parse(xhr.responseText);
                    var messageText = '';
            
                    for (var key in response) {
                        if (response.hasOwnProperty(key)) {
                            messageText += key + ': ' + response[key] + '\n';
                        }
                    }     
                    $('#message').text(messageText).css('color', 'red');;
                } catch (e) {
                    $('#message').text('An error occurred, but the response could not be parsed.').css('color', 'red');;
                }
            }
        });
    });

    // Add Bus Form
    $("#busForm").submit(function (e) {
        e.preventDefault(); // Prevent the default form submission
        var formData = {
            "regNo":$('#busId').val(),
            "depo":$('#depo').val(),
        }
        spinner(1)
        $.ajax({
            url: `${baseUrl}/api/bus/`,
            method: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(formData),
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function (response) {
                spinner(0)
                if (response['regNo']===formData['regNo']){
                    alert("Done")
                    $('#message').text(`Bus: ${response['regNo']} Added successfully`).css('color', 'green');
                }
            },
            error: function (xhr, status, error) {
                spinner(0)
                // Handle errors (e.g., show an error message)
                console.log("Error: " + error);
                console.log("Status: " + status);
                console.log("Response: " + xhr.responseText);
            
                // Check the response text for a specific error message
                try {
                    var response = JSON.parse(xhr.responseText);
                    var messageText = '';
            
                    for (var key in response) {
                        if (response.hasOwnProperty(key)) {
                            messageText += key + ': ' + response[key] + '\n';
                        }
                    }     
                    $('#message').text(messageText).css('color', 'red');;
                } catch (e) {
                    $('#message').text('An error occurred, but the response could not be parsed.').css('color', 'red');;
                }
            }
        });
        document.getElementById("busForm").reset();
    });

    //For Back Button    
    const backButton = document.getElementById("backButton");
    if (backButton !== null){
      backButton.addEventListener("click", function() {
      history.back();
      });
    }  
});

//Create New Pilot or Employees
async function createUser(userType,userid){
    var formData = {
        "username":userid
    };
    spinner(1)
    await $.ajax({
        url: `${baseUrl}/api/${userType}/`,
        method: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(formData),
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function (response) {
            spinner(0)
            if (response){
                alert("Done");
                $('#message').text(`User Added successfully`).css('color', 'green');
                // document.getElementById("addUser").reset();
            }
        },
        error: function (xhr, status, error) {
                spinner(0)
            // Handle errors (e.g., show an error message)
            console.log("Error: " + error);
            console.log("Status: " + status);
            console.log("Response: " + xhr.responseText);
        
            // Check the response text for a specific error message
            try {
                var response = JSON.parse(xhr.responseText);
                var messageText = '';
        
                for (var key in response) {
                    if (response.hasOwnProperty(key)) {
                        messageText += key + ': ' + response[key] + '\n';
                    }
                }     
                $('#message').text(messageText).css('color', 'red');;
            } catch (e) {
                $('#message').text('An error occurred, but the response could not be parsed.').css('color', 'red');;
            }
        }
    });
}

//Returns an user id by passing username
function usernameToID(username) {
    return new Promise((resolve, reject) => {
        spinner(1)
        $.ajax({
            url: `${baseUrl}/api/users/?username=${username}`,
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function (response) {
                spinner(0)
                // console.log(response)
                if (response[0]) {
                    resolve(response[0]['id']);
                }
                else {
                    resolve(0);
                }
            },
            error: function (xhr, status, error) {
                spinner(0)
                // Handle errors (e.g., show an error message)
                console.log("Error: " + error);
                console.log("Status: " + status);
                console.log("Response: " + xhr.responseText);
            
                // Check the response text for a specific error message
                try {
                    var response = JSON.parse(xhr.responseText);
                    var messageText = '';
            
                    for (var key in response) {
                        if (response.hasOwnProperty(key)) {
                            messageText += key + ': ' + response[key] + '\n';
                        }
                    }     
                    $('#message').text(messageText).css('color', 'red');;
                } catch (e) {
                    $('#message').text('An error occurred, but the response could not be parsed.').css('color', 'red');;
                }
                reject(0)
            }
        });
    });
}

//Delete users from DB
function deluser() {
    var toDeleteUsername = $('#delid').val();
    // console.log(toDeleteUsername)
    usernameToID(toDeleteUsername)
        .then(id => {
            spinner(1)
            $.ajax({
                url: `${baseUrl}/api/users/${id}/`,
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                success: function (response) {
                spinner(0)
                    // console.log(response)
                    if (response['message']=="User deleted successfully"){
                        alert("Done")
                        $('#message').text(`User: ${toDeleteUsername} Deleted successfully`).css('color', 'green');
                    }else{
                        $('#message').text(`Error: Invalid UserID`).css('color', 'red');
                    } 
                },
                error: function (xhr, status, error) {
                spinner(0)
                    // Handle errors (e.g., show an error message)
                    console.log("Error: " + error);
                    console.log("Status: " + status);
                    console.log("Response: " + xhr.responseText);
                
                    // Check the response text for a specific error message
                    try {
                        var response = JSON.parse(xhr.responseText);
                        var messageText = '';
                
                        for (var key in response) {
                            if (response.hasOwnProperty(key)) {
                                messageText += key + ': ' + response[key] + '\n';
                            }
                        }     
                        $('#message').text(messageText).css('color', 'red');;
                        alert(messageText)
                    } catch (e) {
                        $('#message').text('An error occurred, but the response could not be parsed.').css('color', 'red');
                        alert("An error occurred, but the response could not be parsed.")
                    }
                }
            });
        })
        .catch(error => {
            console.error(error);
        });  
    }

//Delete Bus from DB
async function delbus() {
    var toDeleteRegNo = $('#delid').val();
    spinner(1)
    await $.ajax({
        url: `${baseUrl}/api/bus/${toDeleteRegNo}/`,
        method: "DELETE",
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function (response, status, xhr) {
            spinner(0)
            if (xhr.status === 204) {
                // Perform actions for 204 response
                $('#message').text(`Bus: ${toDeleteRegNo} Deleted successfully`).css('color', 'green');;
                alert("Done");
            } else {
                console.log(response);
                // Perform actions for other successful responses
            }
        },
        error: function (xhr, status, error) {
                spinner(0)
            // Handle errors (e.g., show an error message)
            console.log("Error: " + error);
            console.log("Status: " + status);
            console.log("Response: " + xhr.responseText);
        
            // Check the response text for a specific error message
            try {
                var response = JSON.parse(xhr.responseText);
                var messageText = '';
        
                for (var key in response) {
                    if (response.hasOwnProperty(key)) {
                        messageText += key + ': ' + response[key] + '\n';
                    }
                }     
                $('#message').text(messageText).css('color', 'red');;
                alert(messageText)
            } catch (e) {
                $('#message').text('An error occurred, but the response could not be parsed.').css('color', 'red');
                alert('An error occurred, but the response could not be parsed.')
            }
        }
    });
    }  

// Proper Logout Mechanism
async function Logout(){
    spinner(1)
    await $.ajax({
        url: `/api/logout/`,
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-CSRFToken': csrftoken
        },
        success: function (response, status, xhr) {
            spinner(0)
            localStorage.removeItem('AdminLoginToken');
            localStorage.removeItem('PilotLoginToken');
            if (response['success']) {
                window.location.href = "/login"; 
            } else {
                console.log(response);
            }
        },
        error: function (xhr, status, error) {
            spinner(0)
            window.location.href = "/login/";
            // Handle errors (e.g., show an error message)
            console.log("Error: " + error);
            console.log("Status: " + status);
            console.log("Response: " + xhr.responseText);
        
        // Check the response text for a specific error message
        try {
            spinner(0)
            var response = JSON.parse(xhr.responseText);
            var messageText = '';
    
            for (var key in response) {
                if (response.hasOwnProperty(key)) {
                    messageText += key + ': ' + response[key] + '\n';
                }
            }     
            $('#message').text(messageText).css('color', 'red');;
            // alert(messageText)
        } catch (e) {
            spinner(0)
            $('#message').text('An error occurred, but the response could not be parsed.').css('color', 'red');
            // alert('An error occurred, but the response could not be parsed.')
        }
    }
    });
}

// Get CSRF Token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

//Get use details in login
async function getUserDetails(){
    spinner(1)
    await $.ajax({
        type: "GET", 
        url: `${baseUrl}/api/user/`,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function (response) {
            spinner(0)
            if (response){
                var username = response['username'] 
                var fname = response['first_name']
                var lname = response['last_name']
                let name = `${fname} ${lname}`
                if (lname==undefined){
                name= `${fname}`}
                $('#name').text(name)
                $('#userid').text(username)
                $('#message').text(`Have a Great Day`).css('color', 'Cyan');
            }
        },
        error: function (xhr, status, error) {
                spinner(0)
            // Handle errors (e.g., show an error message)
            console.log("Error: " + error);
            console.log("Status: " + status);
            console.log("Response: " + xhr.responseText);
        
            // Check the response text for a specific error message
            try {
                var response = JSON.parse(xhr.responseText);
                var messageText = '';
        
                for (var key in response) {
                    if (response.hasOwnProperty(key)) {
                        messageText += key + ': ' + response[key] + '\n';
                    }
                }     
                $('#message').text(messageText).css('color', 'red');;
                // alert(messageText)
            } catch (e) {
                $('#message').text('An error occurred, but the response could not be parsed.').css('color', 'red');
                // alert('An error occurred, but the response could not be parsed.')
            }
        }
    });
}

function spinner(val) {
    if (val === 1) {
        $('#loadingSpinner').removeClass('d-none');
    } else if (val === 0) {
        $('#loadingSpinner').addClass('d-none');
    }
  }
