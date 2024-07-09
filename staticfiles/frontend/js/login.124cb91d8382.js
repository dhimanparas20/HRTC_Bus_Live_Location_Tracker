const csrftoken = getCookie('csrftoken');
$(document).ready(function() {
  spinner(0)
  //Login Form Submittion
  $('#Form').submit(function(event) {
    
      event.preventDefault(); // Prevent form submission
      // Create an object with the form data
      var formData = {
          'username': $('#uname').val(),
          'password': $('#password').val(),
      };
      spinner(1)
      $.ajax({
        url: '/api/login/',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(formData),
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin', // Do not send CSRF token to another domain.
        success: function(response) {
          spinner(0)
            $('#message').text("")
            const token = response.access;
          
            if (response.payload.employee) {
                localStorage.setItem('AdminLoginToken', token);
                window.location.href = `/employee/`; 
            } else if (response.payload.pilot) {
                localStorage.setItem('PilotLoginToken', token);
                window.location.href = `/pilot/`; 
            } else {
                $('#message').text("Invalid User or Password. Try again");
            }
        },
        error: function (xhr, status, error) {
          spinner(0)
          // Handle errors (e.g., show an error message)
          console.log("Error: " + error);
          console.log("Status: " + status);
          console.log("Response: " + xhr.responseText);
          console.log("Full response: ", xhr);
          // Check the response text for a specific error message
          var response = JSON.parse(xhr.responseText);
          if (response.error === "Invalid credentials") {
              $('#message').text("Invalid User or Password. Try again");
          }
      }
    });
  });
});

//Spinner show
function spinner(val) {
  if (val === 1) {
      $('#loadingSpinner').removeClass('d-none');
  } else if (val === 0) {
      $('#loadingSpinner').addClass('d-none');
  }
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