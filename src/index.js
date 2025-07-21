import dotenv from 'dotenv';
import connectDB from './db/db_connection.js';

dotenv.config({
     path: './public/temp/.env'
});

connectDB();





// app.get('/',(req ,res )=>{
//     res.send("Hey, How are you.......");
// })
// app.get('/home',(req , res)=>{
//     res.send("Hey, This is your home page");
// })
// app.get('/login',(req,res)=>{
//     res.send('<h1>Please login your account here...<h1/>')
// })
// app.listen(port, ()=>{
//     console.log(`Server is running on ${port}`);
// })