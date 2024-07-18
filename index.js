const express = require("express");
const path= require("path")
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");

const app = express();
const socket = require("socket.io");
require("dotenv").config();

app.use(cors());
app.use(express.static(__dirname + "/public"))
app.use(express.json());

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/",(req,res)=>{
  res.send("rohit")
})

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server,{
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
let users=[]
io.on("connection",(socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userId) =>{
    onlineUsers.set(userId, socket.id);
    users=[...new Set([...users,userId])]
    io.emit('online_users',users)
  });

  socket.on("offline_users", (userId) =>{
    users=users.filter(u=>u!==userId);
    io.emit('online_users',users)
  });
 

  socket.on("send-msg",(data)=>{
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket){
      socket.to(sendUserSocket).emit("msg-recieve",data);
    }
  });
})
//=============join ofline and online=========================




