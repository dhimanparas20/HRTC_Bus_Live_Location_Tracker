let map;
let currentMarker = null;
let socket = null;
const baseUrl = window.location.origin;
const mapzoom = 16

spinner(0)
// Initialize the map only once
document.addEventListener('DOMContentLoaded', function() {
  $('#message').text(`Welcome to HRTC Tracker`).css("color","cyan")
  map = L.map('map').setView([0, 0], mapzoom); // Set default zoom to 15

  // Satellite view
  L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  }).addTo(map);

  // Fetch all stations and display them
  fetch(`${baseUrl}/api/stations/`)
      .then(response => response.json())
      .then(data => {
          const fromSelect = document.getElementById('from');
          const toSelect = document.getElementById('to');

          data.forEach(station => {
              const fromOption = document.createElement('option');
              fromOption.value = station.id;
              fromOption.textContent = station.stationName;
              fromSelect.appendChild(fromOption);

              const toOption = document.createElement('option');
              toOption.value = station.id;
              toOption.textContent = station.stationName;
              toSelect.appendChild(toOption);
          });
      })
      .catch(error => console.error('Error fetching stations:', error));
});

// Function to search for buses
function searchBuses() {
  const regno = document.getElementById('regno').value;
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;

  let url = `${baseUrl}/api/getonline/`;
  if (from) {
      url += '?from=' + from;
  }
  if (to) {
      url += '&to=' + to;
  }
  if (regno) {
      url += '?regno=' + regno;
  }
  spinner(1)
  fetch(url)
      .then(response => response.json())
      .then(data => {
          spinner(0)
          const busTable = document.getElementById('bus-table').getElementsByTagName('tbody')[0];
          busTable.innerHTML = '';
          
          data.forEach(bus => {
              const row = document.createElement('tr');

              //regno
              const regNoCell = document.createElement('td');
              regNoCell.textContent = bus.regNo;
              row.appendChild(regNoCell);
  
              // from 
              const fromCell = document.createElement('td');
              IdToStation(bus.frm)
              .then(stationName => {
                fromCell.textContent = stationName;
              })
              .catch(error => {
                spinner(0)
                console.error('Error:', error);
                // Handle the error as needed
              });
              row.appendChild(fromCell);

              // to
              const toCell = document.createElement('td');
              IdToStation(bus.to)
              .then(stationName => {
                toCell.textContent = stationName;
              })
              .catch(error => {
                console.error('Error:', error);
                // Handle the error as needed
              });
              row.appendChild(toCell);

              //message column 
              const message = document.createElement('td');
              message.textContent = bus.message;
              row.appendChild(message);

              //online/offline status column
              const statusCell = document.createElement('td');
              statusCell.textContent = bus.isOnline ? 'Online' : 'Offline';
              row.appendChild(statusCell);

              //action 
              const actionCell = document.createElement('td');
              const trackBtn = document.createElement('button');
              trackBtn.classList.add('btn', 'btn-primary', 'btn-sm');
              trackBtn.textContent = 'Track';
              trackBtn.addEventListener('click', function() {
                  trackBus(bus.regNo);
              });
              actionCell.appendChild(trackBtn);
              row.appendChild(actionCell);

              busTable.appendChild(row);
          });
      })
      .catch(error => console.error('Error fetching buses:', error),spinner(0));
}

// Add event listeners for dynamic search
document.getElementById('regno').addEventListener('input', searchBuses);
document.getElementById('from').addEventListener('change', searchBuses);
document.getElementById('to').addEventListener('change', searchBuses);

// Track a bus marks (the location in map)
async function trackBus(regNo) {
  if (socket) {
      socket.close();
  }
  socket = await new WebSocket(`${WEBSOCKET_URL}/hrtc/${regNo}/`);

  socket.onopen = function() {
      $('#message').text(`Connected to HRTC Server`).css("color","green")
      console.log('WebSocket connection opened');
  };

 socket.onmessage = function(event) {
      const data = JSON.parse(event.data);
      // console.log(data)

      // Remove the current marker if it exists
      if (currentMarker) {
          map.removeLayer(currentMarker);
      }

      // Create a new marker at the updated location
      const newMarker =  L.marker([data.latitude, data.longitude]).addTo(map);
      
      //This Fn is made to resolve id to Station Name in Map Marker
      function bindPopupWithStationNames(newMarker, regNo, data) {
        Promise.all([IdToStation(data.frm), IdToStation(data.to)])
          .then(([fromStation, toStation]) => {
            newMarker.bindPopup(`
              <b>Bus:</b> ${regNo}<br>
              <b>From:</b> ${fromStation}<br>
              <b>To:</b> ${toStation}<br>
              <b>Pilot:</b> ${data.Pilot}<br>
              <b>Status:</b> ${data.isOnline ? 'Online' : 'Offline'}
            `).openPopup();
          })
          .catch(error => {
            console.error('Error binding popup:', error);
          });
      }
      bindPopupWithStationNames(newMarker, regNo, data);
      
      newMarker.bindPopup(`
          <b>Bus:</b> ${regNo}<br>
          <b>From:</b> ${data.frm}<br>
          <b>To:</b> ${data.to}<br>
          <b>Pilot:</b> ${data.Pilot}<br>
          <b>Status:</b> ${data.isOnline ? 'Online' : 'Offline'}
      `).openPopup();

      // Update currentMarker to the new marker
      currentMarker = newMarker;

      // Set map view to the new location
      map.setView([data.latitude, data.longitude], mapzoom);
  };

  socket.onclose = function() {
      console.log('WebSocket connection closed');
      $('#message').text(`Disconnected to HRTC Server`).css("color","red")

  };
}


// Returns a station name by passing station ID
function IdToStation(stationid) {
  return new Promise((resolve, reject) => {
    fetch(`${baseUrl}/api/stations/?id=${stationid}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok',);
  
        }
        return response.json();
      })
      .then(data => {
        if (data[0]['stationName']) {
          resolve(data[0]['stationName']);
        } else {
          resolve('Unknown Station');
        }
      })
      .catch(error => {
        console.error('Error fetching station:', error);
        reject('Unknown Station');
      });
  });
}

function spinner(val) {
  if (val === 1) {
      $('#loadingSpinner').removeClass('d-none');
  } else if (val === 0) {
      $('#loadingSpinner').addClass('d-none');
  }
}