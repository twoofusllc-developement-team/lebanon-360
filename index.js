const express = require('express');
const app = express();
const DB = require('./database').connectDB; 
const cartRoutes = require ('./routes/cartRoutes');
const offeringRoutes = require('./routes/offeringRoutes');
const storyRoutes = require('./routers/storyRoutes');

DB(); // Connect to MongoDB

app.use(express.json()); 
app.use('/api/cart', cartRoutes);
 app.use('/api/stories', storyRoutes);

 app.use('/api/offerings', offeringRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
