document.addEventListener("DOMContentLoaded", () => {
    const rideForm = document.getElementById("ride-form");
    const resultsContainer = document.getElementById("results");
    const resultsGrid = document.getElementById("results-grid");
    const loader = document.getElementById("loader");
  
    let selectedVehicleType = "";
  
    // Handle vehicle selection and highlight background color
    document.querySelectorAll(".vehicle-box").forEach((box) => {
        box.addEventListener("click", () => {
          // Reset the border and background color for all vehicle boxes
          document.querySelectorAll(".vehicle-box").forEach((b) => {
            b.style.border = "2px solid #ddd";
            b.style.backgroundColor = ""; // Reset the background color
          });
          
          // Set the selected vehicle box's border and background color
          box.style.border = "2px solid #7e57c2";
          box.style.backgroundColor = "#e8eaf6"; // Light purple background color
          
          // Update the selected vehicle type
          selectedVehicleType = box.querySelector("p").textContent.toLowerCase();
        });
      });
      
  
    rideForm.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const pickup = document.getElementById("pickup").value;
      const dropoff = document.getElementById("dropoff").value;
  
      if (!pickup || !dropoff) {
        alert("Please select both pickup and drop-off locations.");
        return;
      }
  
      if (pickup === dropoff) {
        alert("Pickup and drop-off locations cannot be the same.");
        return;
      }
  
      if (!selectedVehicleType) {
        alert("Please select a vehicle type.");
        return;
      }
  
      resultsContainer.style.display = "block";
      loader.style.display = "block";
      resultsGrid.innerHTML = "";
      resultsContainer.scrollIntoView({ behavior: "smooth" });
  
      setTimeout(() => {
        fetchFareEstimates(pickup, dropoff, selectedVehicleType);
      }, 1000);
    });
  
    function calculateDistance(pickup, dropoff) {
      const locationCoords = {
        "Hitech City": [17.4478, 78.3787],
        "Banjara Hills": [17.4126, 78.4440],
        "Gachibowli": [17.4401, 78.3483],
        "Secunderabad": [17.4399, 78.4983],
        "Jubilee Hills": [17.4229, 78.4081],
        "Madhapur": [17.4484, 78.3914],
        "Kukatpally": [17.4843, 78.3994],
        "Rajiv Gandhi International Airport": [17.2403, 78.4294],
        "Musarambagh": [17.3692, 78.5244],
        "GRIET College": [17.5124, 78.3912],
        "Saidabad": [17.3652, 78.5284],
        "ECIL": [17.5003, 78.5754],
        "KPHB": [17.4843, 78.4094],
        "LB Nagar": [17.3483, 78.5564],
        "Miyapur": [17.4933, 78.3914],
        "Mehdipatnam": [17.3933, 78.4354],
        "Bachupally": [17.5523, 78.3844],
        "Gokaraju Ranga Raju College": [17.5323, 78.3854]
      };
  
      const [lat1, lon1] = locationCoords[pickup];
      const [lat2, lon2] = locationCoords[dropoff];
  
      const R = 6371; // Radius of Earth in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
  
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c * 10) / 10; // rounded distance
    }
  
    function fetchFareEstimates(pickup, dropoff, vehicleType) {
      const distance = calculateDistance(pickup, dropoff);
  
      // Updated base fares and per km rates based on current Hyderabad rates
      const baseFare = {
        uber: { auto: 30, bike: 25, cab: 50 },
        ola: { auto: 28, bike: 22, cab: 45 },
        rapido: { auto: 25, bike: 20, cab: 40 }
      };
  
      const perKmRate = {
        uber: { auto: 12, bike: 10, cab: 18 },
        ola: { auto: 11, bike: 9, cab: 16 },
        rapido: { auto: 10, bike: 8, cab: 15 }
      };

      // Additional charges for peak hours (6-10 AM and 5-9 PM)
      const peakHourMultiplier = 1.2;
      const currentHour = new Date().getHours();
      const isPeakHour = (currentHour >= 6 && currentHour < 10) || (currentHour >= 17 && currentHour < 21);
      const isNightTime = currentHour >= 22 || currentHour < 6;
  
      // Time multipliers based on vehicle type and traffic conditions
      const platformTimeMultipliers = {
        uber: { auto: 2.5, bike: 1.8, cab: 2.3 },
        ola: { auto: 2.4, bike: 1.7, cab: 2.2 },
        rapido: { auto: 2.3, bike: 1.6, cab: 2.1 }
      };
  
      const platforms = ["uber", "ola", "rapido"];
      const data = {};
  
      platforms.forEach((platform) => {
        data[platform] = [];
  
        ["auto", "bike", "cab"].forEach((type) => {
          if (vehicleType === "all" || vehicleType === type) {
            // Calculate base fare with peak hour multiplier if applicable
            let fare = baseFare[platform][type] + perKmRate[platform][type] * distance;
            if (isPeakHour) {
              fare *= peakHourMultiplier;
            }
            
            // Add night charges (10 PM to 6 AM)
            if (isNightTime) {
              fare *= 1.1; // 10% extra for night rides
            }
            
            // Get platform-specific time multiplier for the vehicle type
            const timeMultiplier = platformTimeMultipliers[platform][type];
            const time = Math.round(distance * timeMultiplier + (isPeakHour ? 10 : 5));
  
            let url;
            if (platform === "uber") {
              url = `https://m.uber.com/looking?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}`;
            } else if (platform === "ola") {
              url = `https://book.olacabs.com/?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}`;
            } else {
              // Rapido URL with proper parameters
              const rapidoPickup = encodeURIComponent(pickup.replace(/\s+/g, '+'));
              const rapidoDropoff = encodeURIComponent(dropoff.replace(/\s+/g, '+'));
              url = `https://www.rapido.bike/?pickup=${rapidoPickup}&dropoff=${rapidoDropoff}&source=ridewise`;
            }
  
            data[platform].push({ 
              type: type.charAt(0).toUpperCase() + type.slice(1), 
              fare: Math.round(fare), 
              time, 
              url,
              distance: Math.round(distance * 10) / 10 // Round distance to 1 decimal place
            });
          }
        });
      });
  
      loader.style.display = "none";
      displayFareEstimates(data, vehicleType);
    }
  
    function displayFareEstimates(data, vehicleType) {
      resultsGrid.innerHTML = "";
  
      const icons = {
        auto: "auto.png",
        bike: "bike.png",
        cab: "cab.jpg"
      };
  
      const platformNames = {
        uber: "Uber",
        ola: "Ola",
        rapido: "Rapido"
      };
  
      const platformColors = {
        uber: "black",
        ola: "#4caf50",
        rapido: "#f4d019"
      };

      const currentHour = new Date().getHours();
      const isPeakHour = (currentHour >= 6 && currentHour < 10) || (currentHour >= 17 && currentHour < 21);
      const isNightTime = currentHour >= 22 || currentHour < 6;
  
      Object.keys(data).forEach((platform) => {
        const rides = data[platform];
  
        if (!rides.length) return;
  
        const section = document.createElement("div");
        section.className = "platform-section";
        section.innerHTML = `<h3 style="color:${platformColors[platform]}; margin-bottom: 16px;">${platformNames[platform]}</h3>`;
        resultsGrid.appendChild(section);
  
        rides.forEach((ride) => {
          const iconSrc = icons[ride.type.toLowerCase()] || icons.cab;
  
          const card = document.createElement("div");
          card.className = `ride-card ${platform}`;
  
          let additionalCharges = [];
          if (isPeakHour) {
            additionalCharges.push("Peak Hour Charges (20% extra)");
          }
          if (isNightTime) {
            additionalCharges.push("Night Charges (10% extra)");
          }
  
          card.innerHTML = `
            <div class="ride-logo" style="display: flex; align-items: center; gap: 8px;">
              <img src="${iconSrc}" alt="${ride.type}" style="height: 32px;" />
              <strong>${ride.type}</strong>
            </div>
            <div class="ride-price">₹${ride.fare}</div>
            <div class="ride-details">
              <p><strong>Distance:</strong> ${ride.distance} km</p>
              <p><strong>Estimated Time:</strong> ${ride.time} mins</p>
              ${additionalCharges.length > 0 ? `<p class="additional-charges"><strong>Additional Charges:</strong> ${additionalCharges.join(", ")}</p>` : ""}
              <a href="${ride.url}" target="_blank">
                <button class="book-btn" style="margin-top: 10px;">Book Now</button>
              </a>
            </div>
          `;
  
          section.appendChild(card);
        });
      });
    }
});
