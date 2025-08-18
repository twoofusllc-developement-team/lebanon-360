const express = require('express');
const app = express();
const DB = require('./database').connectDB; 
const offeringRoutes = require('./routes/offeringRoutes');
const personRoutes = require('./routers/personRoutes');

app.use(express.json()); 

app.use('/api/stories', storyRoutes);

 app.use('/api/offerings', offeringRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
