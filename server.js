const express = require('express')
const cookiearser=require("cookie-parser")
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const port = process.env.PORT || 6000
const UserRoute=require("./Routes/user.route")
const EventRoute=require("./Routes/Event.route")
require("dotenv").config();
app.use(cookiearser())
require("./config/db")
app.use("/api/v1/auth/",UserRoute)
app.use("/api/v2/event",EventRoute)
app.get("/",(req,res)=>{
    res.send("<center><h1>Event_management_App All apis</h1><br>Get All Apis Use My Link <a href=https://github.com/Kotak111/EventmanageMent_system target=_blank>Repository :- EventmanageMent_system</a></center>")
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))