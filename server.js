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
    axios.post('http://www.mapquestapi.com/directions/v2/route?key=PnhXYN4xTR8F3bexWpuVOi4olDU5kIla', {
        locations: [req.body.origin, req.body.destination]
    })
    .then(response => {
        res.send(response.data.route.distance.toString());
    })
    .catch(err => {
        console.error(err);
    })
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
    // Async scope so await can be used
    (async () => {
        let expensiveContactIds = new Set(); // Stores Contact Ids of customers with trip expense > 25000
        for (var trip of await csvAsJson('./fake_finity_data/trip_data.csv')) {
            if (parseInt(trip['trip_expense_total'].substring(1)) > 25000) {
                expensiveContactIds.add(trip['contact_id']);
            }
        }

        result = []; // Stores firstname,lastname,email of customers with trip expense > 25000
        for (var contact of await csvAsJson('./fake_finity_data/contacts.csv')) {
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

async function csvAsJson(path) {
    return csvtojson().fromFile(path);
}


app.get('/tripDistances', (req, res) => {
    // TODO: return a list of distances between the origin and destinations within the trip_data using MapQuest API
    // Maybe make a new function(origin, destination) to calculate distance using Mapquest?
})


const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`))