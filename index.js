const express = require('express');
const app = express();
const DB = require('./database').connectDB; 
const offeringRoutes = require('./routers/offeringRoutes');
const personRoutes = require('./routers/personRoutes');
const storyRoutes = require('./routers/storyRoutes');
const offeringRoutes1 = require('./routers/postofferingroute');
const getOfferingRoutes = require('./routers/getOfferingRoute');

app.use(express.json()); 

app.use('/api/stories', storyRoutes);
app.use('/api', offeringRoutes1);

 app.use('/api/offerings', offeringRoutes);
app.use('/api', getOfferingRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
