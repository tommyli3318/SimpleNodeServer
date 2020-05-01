const express = require('express');
const app = express();
app.use(express.json());

const axios = require('axios');
const csvtojson = require("csvtojson");

// GET to http://localhost:8080/ returns 'Hello World'
app.get('/', (req, res) => {
    res.send('Hello World');
})


// POST request to http://localhost:8080/ with JSON body in the form of
// {
//     "origin": "California",
//     "destination": "Nevada"
// }
// returns a number indicating distance in miles between the two locations
app.post('/', (req, res) => {
    // Async scope to use await
    (async () => {
        distance = await getDistanceBetween(req.body.origin, req.body.destination);
        res.send(distance.toString());
    })();
})


// GET to http://localhost:8080/expensiveTrips returns
// a list of people with first name, last name, and email address 
// of those contacts that have been on a trip with more than $25,000 expense amount

// In SQL Statements:
// SELECT first_name, last_name, email 
// FROM Contacts
// JOIN TripData
// ON Contacts.id=TripData.contact_id
// WHERE trip_expense_total > 25000

app.get('/expensiveTrips', (req, res) => {
    // Async scope to use await
    (async () => {
        let expensiveContactIds = new Set(); // Stores Contact Ids of customers with trip expense > 25000
        for (let trip of await csvAsJson('./fake_finity_data/trip_data.csv')) {
            if (parseInt(trip['trip_expense_total'].substring(1)) > 25000) {
                expensiveContactIds.add(trip['contact_id']);
            }
        }

        let result = []; // Stores firstname,lastname,email of customers with trip expense > 25000
        for (let contact of await csvAsJson('./fake_finity_data/contacts.csv')) {
            if (expensiveContactIds.has(contact['id'])) {
                // this customer had an expensive trip
                result.push({
                    'first_name': contact['first_name'], 
                    'last_name': contact['last_name'], 
                    'email': contact['email']
                });
            }
        }

        res.send(result);
    })();
})


// GET to http://localhost:8080/tripDistances returns
// list of distances between the origin and destinations within the trip_data using MapQuest API
// Currently times out due to MapQuest API being too slow
app.get('/tripDistances', (req, res) => {
    // MapQuest docs for POST with latLng
    // https://developer.mapquest.com/documentation/common/forming-locations/
    (async () => {
        let distances = [];
        for (let trip of await csvAsJson('./fake_finity_data/trip_data.csv')) {
            let origin = {
                "latLng": {
                  "lat": parseFloat(trip['trip_origin_latitude']),
                  "lng": parseFloat(trip['trip_origin_longitude'])
                }
            }

            let destination  = {
                "latLng": {
                  "lat": parseFloat(trip['trip_dest_latitude']),
                  "lng": parseFloat(trip['trip_dest_longitude'])
                }
            }

            distances.push(await getDistanceBetween(origin, destination));
        }

        res.send(distances);
    })();
})


async function csvAsJson(path) {
    return csvtojson().fromFile(path);
}

async function getDistanceBetween(origin, destination) {
    let response = await axios.post('http://www.mapquestapi.com/directions/v2/route?key=PnhXYN4xTR8F3bexWpuVOi4olDU5kIla', {
        locations: [origin, destination]
    })
    return response.data.route.distance;
}


const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`))