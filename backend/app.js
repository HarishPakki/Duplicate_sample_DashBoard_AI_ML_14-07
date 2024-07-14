const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
