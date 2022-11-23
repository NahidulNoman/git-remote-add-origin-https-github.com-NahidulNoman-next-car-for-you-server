const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

// middle wear
app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {
    res.send('you hit the road server is running..')
});

app.listen(port , () => {
    console.log(`your hit the road server is running port ${port}`)
});