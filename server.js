const express = require('express');
const app = express();
app.use(express.json());

const axios = require('axios');

app.get('/', (req, res) => {
    res.send('Hello World');
})

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

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`))