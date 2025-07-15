import dotenv from 'dotenv';
dotenv.config();
import express from "express";
const app = express()
const port = 3000

app.get('/',(req ,res )=>{
    res.send("Hey, How are you.......");
})
app.get('/home',(req , res)=>{
    res.send("Hey, This is your home page");
})
app.get('/login',(req,res)=>{
    res.send('<h1>Please login your account here...<h1/>')
})
app.listen(process.env.port , ()=>{
    console.log(`Server is running on ${port}`);
})