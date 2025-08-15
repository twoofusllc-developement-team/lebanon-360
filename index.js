const express = require('express');
const app = express();
const DB = require('./database').connectDB; 
const offeringRoutes = require('./routes/offeringRoutes');

DB(); // Connect to MongoDB

app.use(express.json()); 

app.use('/api/v1/offerings', offeringRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
