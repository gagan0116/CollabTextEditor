import {createServer} from "http";
import {Server} from "socket.io"

const mongoose = require("mongoose")
const Document = require("./Document")
const express = require('express')
mongoose.connect("mongodb+srv://gagan16:Gagan@123@collabtext.0g9sk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})
const app = express()

const dotenv = require('dotenv').config()

const port = process.env.PORT || 80;

const httpServer = require('http').createServer()

server.listen(port ,  () => {
  console.log(`Server Running on port: ${port}`);
});

const io = require("socket.io")(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

const defaultValue = ""

io.on("connection", socket => {
    socket.on('get-document', async documentId =>{
        const document = await findOrCreateDocument(documentId)
        socket.join(documentId)
        socket.emit('load-document', document.data)
        socket.on('send-changes', delta => {
            socket.broadcast.to(documentId).emit("receive-changes", delta)
        }) 
        
        socket.on("save-document", async data => {
            await Document.findByIdAndUpdate(documentId, {data})
        })
    })
})

httpServer.listen(3000)

async function findOrCreateDocument(id) {
    if (id == null) return
  
    const document = await Document.findById(id)
    if (document) return document
    return await Document.create({ _id: id, data: defaultValue })
  }