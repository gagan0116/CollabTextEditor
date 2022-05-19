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

const server = require('http').createServer(app)

server.listen(port , '0.0.0.0', () => {
  console.log(`Server Running on port: ${port}`);
});

const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
  })

  app.get('/', function(req, res) {
    res.sendfile(__dirname + '/documents/e3350329-4dd2-46c7-8899-5799d7525c27');
});

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