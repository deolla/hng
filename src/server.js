const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const organisationsRoute = require ('./routes/organisationRoute');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api', userRoute);
app.use('/auth', authRoute)
app.use('/api', organisationsRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀💻☕🤔`);
});
