// Import required modules
const express = require("express")
const path = require("path")

// Create an Express application
const app = express()
const PORT = process.env.PORT || 3000

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)))

// API endpoint to get fare estimates
app.get("/api/fares", (req, res) => {
  // Get pickup and dropoff locations from query parameters
  const { pickup, dropoff } = req.query

  // Check if both locations are provided
  if (!pickup || !dropoff) {
    return res.status(400).json({ error: "Both pickup and dropoff locations are required" })
  }

  // Define distances between locations (in km) for Hyderabad
  const distances = {
    "Hitech City": {
      "Banjara Hills": 10,
      Gachibowli: 5,
      Secunderabad: 18,
      "Jubilee Hills": 8,
      Madhapur: 3,
      Kukatpally: 9,
      "Rajiv Gandhi International Airport": 35,
    },
    "Banjara Hills": {
      "Hitech City": 10,
      Gachibowli: 12,
      Secunderabad: 12,
      "Jubilee Hills": 4,
      Madhapur: 8,
      Kukatpally: 15,
      "Rajiv Gandhi International Airport": 30,
    },
    Gachibowli: {
      "Hitech City": 5,
      "Banjara Hills": 12,
      Secunderabad: 22,
      "Jubilee Hills": 10,
      Madhapur: 6,
      Kukatpally: 12,
      "Rajiv Gandhi International Airport": 30,
    },
    Secunderabad: {
      "Hitech City": 18,
      "Banjara Hills": 12,
      Gachibowli: 22,
      "Jubilee Hills": 14,
      Madhapur: 16,
      Kukatpally: 12,
      "Rajiv Gandhi International Airport": 35,
    },
    "Jubilee Hills": {
      "Hitech City": 8,
      "Banjara Hills": 4,
      Gachibowli: 10,
      Secunderabad: 14,
      Madhapur: 6,
      Kukatpally: 14,
      "Rajiv Gandhi International Airport": 32,
    },
    Madhapur: {
      "Hitech City": 3,
      "Banjara Hills": 8,
      Gachibowli: 6,
      Secunderabad: 16,
      "Jubilee Hills": 6,
      Kukatpally: 10,
      "Rajiv Gandhi International Airport": 33,
    },
    Kukatpally: {
      "Hitech City": 9,
      "Banjara Hills": 15,
      Gachibowli: 12,
      Secunderabad: 12,
      "Jubilee Hills": 14,
      Madhapur: 10,
      "Rajiv Gandhi International Airport": 40,
    },
    "Rajiv Gandhi International Airport": {
      "Hitech City": 35,
      "Banjara Hills": 30,
      Gachibowli: 30,
      Secunderabad: 35,
      "Jubilee Hills": 32,
      Madhapur: 33,
      Kukatpally: 40,
    },
  }

  // Get the distance between the two locations
  let distance = 10 // Default distance if not found

  if (distances[pickup] && distances[pickup][dropoff]) {
    distance = distances[pickup][dropoff]
  } else if (distances[dropoff] && distances[dropoff][pickup]) {
    distance = distances[dropoff][pickup]
  }

  // Calculate estimated time (rough estimate: 2 min per km + base time)
  const estimatedTime = Math.round(distance * 2 + 5)

  // Add some randomness to make the prices look more realistic
  const randomFactor = () => Math.floor(Math.random() * 20)

  // Generate fare estimates based on distance
  // Each service has slightly different pricing models
  const uberFare = Math.round(50 + distance * 12 + randomFactor())
  const rapidoFare = Math.round(45 + distance * 13 + randomFactor())
  const olaFare = Math.round(40 + distance * 11 + randomFactor())

  // Create response object with fare estimates
  const fareEstimates = {
    uber: {
      service: "Uber",
      fare: uberFare,
      currency: "₹",
      time: estimatedTime,
      distance: distance,
    },
    rapido: {
      service: "Rapido",
      fare: rapidoFare,
      currency: "₹",
      time: estimatedTime + 2, // Slightly different time estimate
      distance: distance,
    },
    ola: {
      service: "Ola",
      fare: olaFare,
      currency: "₹",
      time: estimatedTime - 1, // Slightly different time estimate
      distance: distance,
    },
  }

  // Send the fare estimates as JSON response
  res.json(fareEstimates)
})

// Default route to serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
