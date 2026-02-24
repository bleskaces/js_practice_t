import 'dotenv/config';
import app from './app';
import { initDB } from './config/database';

const PORT = process.env.PORT || 8000;

// init bd
initDB();

// start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📁 Database: ${process.env.DATABASE_URL || './database.sqlite'}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});