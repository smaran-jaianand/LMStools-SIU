const express = require('express');
const cors = require('cors');
const { sequelize } = require('./database');
const tableRoutes = require('./routes/tables');
const exportRoutes = require('./routes/export');
const studentRoutes = require('./routes/students');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Large limit for table data/HTML

app.use('/api/tables', tableRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/students', studentRoutes);

// Sync database and start server
sequelize.sync().then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
