import dotenv from 'dotenv';
import connectDB from './db/db_connection.js';
import app from './app.js';

dotenv.config({
     path: './public/temp/.env'
});

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 6000 , ()=>{
        console.log(`Server is running on prot: ${process.env.PORT}`);
    });
})
.catch((error)=>{
    console.log("MongoDB connection Failed !!!",error);
})
