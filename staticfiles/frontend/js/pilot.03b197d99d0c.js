var intervalId = null; // Initialize the interval ID
var socket = null; // Initialize WebSocket variable
const baseUrl = window.location.origin;
const csrftoken = getCookie('csrftoken');
const token = localStorage.getItem('PilotLoginToken');
const locationSendIntervalTime = 5000


//Dont open page if there is no token
if (!token) {
    window.location.href = "/login/";
}else{
    getUserDetails()
    spinner(0)
}

// Fetch all stations and display them 
document.addEventListener('DOMContentLoaded', function() {
    fetch(`${baseUrl}/api/stations/`)
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('from');
            const select2 = document.getElementById('to');

            data.forEach(station => {
                const option = document.createElement('option');
                option.value = station.id;
                option.textContent = station.stationName;
                select.appendChild(option);
            });
            data.forEach(station => {
                const option = document.createElement('option');
                option.value = station.id;
                option.textContent = station.stationName;
                select2.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching stations:', error));
});

$(document).ready(function() {
    
    // Start Sharing button Click event
    $('#Form').submit(function(event) {
        event.preventDefault();
        startLocationUpdates();
    });
    
    // Stop Sharing button Click event
    $('.stop').click(function(event) {
        event.preventDefault();
        // Stop WebSocket and location updates
        stopLocationUpdates();
    });
});

//Start Sharing location in websocket
function startLocationUpdates() {
    if (navigator.geolocation) {
        var oldLat = 0.0;
        var oldLong = 0.0;
        try {
            spinner(1);
            var busID = $('#id').val();

            // Function to send location data to WebSocket
            //Not using becuse using  successCallback() method
            async function sendLocationData(position) {   
                position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                    // const id = navigator.geolocation.watchPosition(successCallback, errorCallback);
                    const id = navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
                });
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            }    

            // WebSocket connection
            socket = new WebSocket(`${WEBSOCKET_URL}` + `/hrtc/${busID}/?token=${token}`);

            socket.onopen = function(event) {
                spinner(0);
                $('#message').text(`Connected to HRTC Server`).css("color","yellow")
                console.log("WebSocket connected.");
                
                // Define the Sucess callback function
                function successCallback(position) {

                    // console.log(position)
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    const data = {
                        frm: $('#from').val(),
                        to: $('#to').val(),
                        message: $('#msg').val(),
                        latitude: latitude,
                        longitude: longitude
                    };
                    
                    //Dont send updates if the bus isnt moving
                    if (oldLat !== latitude || oldLong !== longitude) {
                        socket.send(JSON.stringify(data));
                        $('#message').text("Location Started").css("color","green")
                        $('#userid').css("color", "green"); // Change color to green
                        $("#location").html(`Latitude: ${latitude} <br> Longitude: ${longitude}`);
                        oldLat = latitude;
                        oldLong = longitude;
                    }
                
                    // console.log('Latitude: ' + latitude + ', Longitude: ' + longitude);
                }
                // Define the error callback function
                function errorCallback(error) {
                    console.error('Error occurred while getting geolocation: ' + error.message);
                }

                // Watch the position
                const options = {
                    enableHighAccuracy: true,
                    timeout: 20000,
                };

                function doc(){
                const id = navigator.geolocation.getCurrentPosition(successCallback, errorCallback,options);
            }
                intervalId = setInterval(doc,locationSendIntervalTime)
                // intervalId = setInterval(sendLocationData, 2000); 
            };
            
            socket.onerror = function(error) {
                spinner(0);
                $('#message').text("ws error").css("color","red")
                console.error('WebSocket error:', error);
            };

            socket.onmessage = function(event) {
                spinner(0);
                var response = JSON.parse(event.data);
                // console.log(response)
                if(response['error']){
                    stopLocationUpdates()
                    $('#message').text(response['error']).css("color","red")
                }
                // response = response['message'];
            }
            
            socket.onclose = function() {
                spinner(0);
                stopLocationUpdates()
                console.log('WebSocket connection closed');
                $('#message').text(`Location Not Sharing`).css("color","red")
          
            };

        } catch (error) {
            spinner(0);
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    $("#location").html("User denied the request for geolocation.").css("color","red");
                    break;
                case error.POSITION_UNAVAILABLE:
                    $("#location").html("Location information is unavailable.").css("color","red");
                    break;
                case error.TIMEOUT:
                    $("#location").html("The request to get user location timed out.").css("color","red");
                    break;
                case error.UNKNOWN_ERROR:
                    $("#location").html("An unknown error occurred.").css("color","red");
                    break;
                default:
                    console.error(error);
            }
        }
    } else {
        alert("Geolocation is not available in this browser.")
        $("#location").html("Geolocation is not available in this browser.").css("color","red");
    }
}

//Stop Sharing location in websocket
function stopLocationUpdates() {
    spinner(0)
    navigator.geolocation.clearWatch(id);
    $('#message').text("Location Stopped").css("color","red")
    clearInterval(intervalId); // Stop interval for sending location updates
    intervalId = null;
    socket.close(); // Close WebSocket connection
    $('#userid').css("color", "red"); // Change color to red
    $("#location").html(`Latitude: 0.00 <br> Longitude: 0.00`); // Reset location display
    oldLat = 0.0;
    oldLong= 0.0;
    // location.reload()
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
            $('#message').text(messageText).css('color', 'red');
            // alert(messageText)
        } catch (e) {
            spinner(0)
            $('#message').text('An error occurred, but the response could not be parsed.').css('color', 'red');
            // alert('An error occurred, but the response could not be parsed.')
        }
    }
    });
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
                $('#userid').text(username).css("color", "red")
                $('#message').text(`Drive Safe`).css('color', 'cyan');
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

//Loading Spinner
function spinner(val) {
    if (val === 1) {
        $('#loadingSpinner').removeClass('d-none'); // Show spinner
    } else if (val === 0) {
        $('#loadingSpinner').addClass('d-none'); // Hide spinner
    }
}