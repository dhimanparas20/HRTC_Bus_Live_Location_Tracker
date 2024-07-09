const token = localStorage.getItem('AdminLoginToken');
const baseUrl = window.location.origin;

if (!token) {
    window.location.href = "/login";
}
spinner(0)
$(document).ready(function() {
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

  // Function to populate pilot table
  function populatePilotTable(response) {
      var tbody = document.getElementById('pilotTableBody');
      var serialNumber = 1;

      response.forEach(function(item) {
        // console.log(item)
          var row = document.createElement('tr');

          // Serial number
          var cellSerial = document.createElement('td');
          cellSerial.textContent = serialNumber++;
          row.appendChild(cellSerial);

          // Name
          var cellName = document.createElement('td');
          cellName.textContent = item.fname + ' ' + item.lname;
          row.appendChild(cellName);

          // Online status
          var cellOnline = document.createElement('td');
          cellOnline.textContent = item.isOnline ? 'Yes' : 'No';
          cellOnline.className = 'onlineStatus';
          row.appendChild(cellOnline);

          // Current Bus
          var cellCurrentBus = document.createElement('td');
          cellCurrentBus.textContent = item.currentBus;
          row.appendChild(cellCurrentBus);

          // Contact
          var cellContact = document.createElement('td');
          cellContact.textContent = item.phone_number;
          row.appendChild(cellContact);

          // Username
          var cellUsername = document.createElement('td');
          cellUsername.textContent = item.exactusername;
          row.appendChild(cellUsername);

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

  // Fetch pilot data
  spinner(1)
  $.ajax({
      url: `${baseUrl}/api/pilot/`,
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`
      },
      success: function(response) {
        spinner(0)
        // console.log(response)
          populatePilotTable(response);
      },
      error: function(xhr, status, error) {
        spinner(0)
          console.error("Error: " + error);
          console.error("Status: " + status);
          console.error("Response: " + xhr.responseText);
      }
  });
});

function spinner(val) {
    if (val === 1) {
        $('#loadingSpinner').removeClass('d-none');
    } else if (val === 0) {
        $('#loadingSpinner').addClass('d-none');
    }
  }