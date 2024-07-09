const token = localStorage.getItem('AdminLoginToken');
const baseUrl = window.location.origin;
let stations = [];
let users = [];

$(document).ready(async function() {
    
    if (!token) {
        window.location.href = "/login";
    } else {
        spinner(0)
        await fetchusers()
        await fetchstations();
    }
    
    // Function to color online status
    function colorOnlineStatus() {
        $(".onlineStatus").each(function() {
            var status = $(this).text();
            if (status === "Yes") {
                $(this).css("color", "green");
            } else if (status === "No") {
                $(this).css("color", "red");
            }
        });
    }

    // Function to populate bus table
    function populateBusTable(response) {
        var tbody = document.getElementById('busTableBody');

        response.forEach(function(item) {
            var row = document.createElement('tr');

            // Registration number
            var cellRegNo = document.createElement('td');
            cellRegNo.textContent = item.regNo;
            row.appendChild(cellRegNo);

            // Online status
            var cellOnline = document.createElement('td');
            cellOnline.textContent = item.isOnline ? 'Yes' : 'No';
            cellOnline.className = 'onlineStatus';
            row.appendChild(cellOnline);

    
            // Depo
            var cellDepo = document.createElement('td');
            cellDepo.textContent = getStationNameById(item.depo);;
            row.appendChild(cellDepo);

            // From
            var cellFrom = document.createElement('td');
            cellFrom.textContent = getStationNameById(item.frm);
            row.appendChild(cellFrom);

            // To
            var cellTo = document.createElement('td');
            cellTo.textContent = getStationNameById(item.to);
            row.appendChild(cellTo);

            // Current pilot
            var cellCurrentPilot = document.createElement('td');
            cellCurrentPilot.textContent = getUserNameById(item.currentPilot) || '';
            row.appendChild(cellCurrentPilot);
            
            // Phone no of pilot
            var cellContactPilot = document.createElement('td');
            cellContactPilot.textContent = getUserContactById(item.currentPilot) || '';
            row.appendChild(cellContactPilot);

            // Message
            var cellMessage = document.createElement('td');
            cellMessage.textContent = item.message || '';
            row.appendChild(cellMessage);

            // Last updated
            var cellLastUpdated = document.createElement('td');
            cellLastUpdated.textContent = item.lastupdated;
            row.appendChild(cellLastUpdated);


            tbody.appendChild(row);
        });

        colorOnlineStatus();
    }

    // Back button event listener
    const backButton = document.getElementById("backButton");
    if (backButton !== null) {
        backButton.addEventListener("click", function() {
            history.back();
        });
    }

    // Fetch bus data
    spinner(1)
    $.ajax({
        url: `${baseUrl}/api/bus/`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function(response) {
            spinner(0)
            populateBusTable(response);
        },
        error: function(xhr, status, error) {
            spinner(0)
            console.error("Error: " + error);
            console.error("Status: " + status);
            console.error("Response: " + xhr.responseText);
        }
    });
});

// Fetch All  stations
async function fetchstations() {
    return await fetch(`${baseUrl}/api/stations/`)
        .then(response => response.json())
        .then(data => {
            stations = data;
        })
        .catch(error => console.error('Error fetching stations:', error));
}

// Function to get the station name by id
function getStationNameById(id) {
    const station = stations.find(station => station.id === id);
    return station ? station.stationName : '- -';
}

// fetch all users in db
async function fetchusers() {
    try {
        const response = await fetch(`${baseUrl}/api/users/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            mode: 'same-origin'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        users = data;
    } catch (error) {
        console.error('Error fetching users:', error);
        // Assuming you want to show the error message in an element with id 'message'
        $('#message').text(`Error: ${error.message}`).css('color', 'red');
    }
}

// Function to get the station name by id
function getUserNameById(id) {
    const user = users.find(user => user.id === id);
    return user ? `${user.first_name} ${user.last_name}`  : '- -';
}

// Function to contact Number the station name by id
function getUserContactById(id) {
    const user = users.find(user => user.id === id);
    return user ? user.phone_number  : '- -';
}

function spinner(val) {
    if (val === 1) {
        $('#loadingSpinner').removeClass('d-none');
    } else if (val === 0) {
        $('#loadingSpinner').addClass('d-none');
    }
  }