const express = require('express');
const app = express();
const DB = require('./database').connectDB; 
DB();
app.use(express.json());
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

const offeringRoutes = require('./routes/offeringRoutes');
const storyRoutes = require('./routers/storyRoutes');



app.use('/api/stories', storyRoutes);

app.use('/api/v1/offerings', offeringRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
