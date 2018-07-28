
const mongo = require('mongodb').MongoClient
const client = require('socket.io').listen(4000).sockets

//connect to mongodb 
mongo.connect('mongodb://127.0.0.1:27017/mongochat', { useNewUrlParser: true }, (err, clientObject) => {
    if(err){
        throw err
    }
    console.log('MongoDB Connected...')

    //connect to Socket.ii
    client.on('connection', (socket) => {
        // let chat = clientObject.db.collection('chats')
        let db = clientObject.db()

        let chat = db.collection('chats')

        //Create function to send status
        sendStatus = (s) => {
            socket.emit('status', s)
        }

        //get chats from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray((err, res) => {
            if(err){
                throw err
            }

            //emit the messages
            socket.emit('output', res)
        })

        //handle input events
        socket.on('input', (data) => {
            console.log(data)
            let name = data.name
            let message = data.message

            //check for name and message
            if(name == '' || message == ''){
                sendStatus('Please enter a name and message!')
            }else{
                // insert to db
                chat.insert({name: name, message: message}, () => {
                    client.emit('output', [data])

                    //send status object
                    sendStatus({
                        message: 'Message Sent',
                        clear: true
                    })
                })
            }
        })

        //handle clear
        socket.on('clear', (data) => {
            // remove all chats from collection
            chat.remove({}, () => {
                socket.emit('cleared')
            })
        })
    })
    // db.close();
})