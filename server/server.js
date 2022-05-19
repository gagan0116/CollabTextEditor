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

app.listen(3001, '0.0.0.0', () => {
  console.log("Server is running.");
});



const server = require('http').createServer(app)
const io = require('socket.io')(server)

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

async function findOrCreateDocument(id) {
    if (id == null) return
  
    const document = await Document.findById(id)
    if (document) return document
    return await Document.create({ _id: id, data: defaultValue })
  }