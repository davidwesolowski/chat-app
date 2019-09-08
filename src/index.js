const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/message.js');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users.js');

const port = process.env.PORT||3000;
const publicDir = path.join(__dirname, '../public');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDir));

io.on('connection', (socket) =>
{
    console.log('WebSocket connection');

    socket.on('join', ({ username, room }, callback) =>
    {
        const { error, user } = addUser({ id: socket.id, username, room  });

        if (error)
        {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Admin', 'Welcome'));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));

        io.to(user.room).emit('roomData',
        {
            room: user.room,
            usersInRoom: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on('sendMsg', (msg, callback) =>
    {
        const filter = new Filter();
        if (filter.isProfane(msg))
            return callback('Profanity is not allowed');

        const user = getUser(socket.id);

        if (user)
        {
            io.to(user.room).emit('message', generateMessage(user.username, msg));
        }

        callback();
    });

    socket.on('sendLocation', (location, callback) =>
    {
        //io.emit('message', `Location - latitude:${location.latitude}, longitude: ${location.longitude}`)
        const user = getUser(socket.id);
        if (user)
        {
            io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
            callback('Location delivered');
        }
        
    });

    socket.on('disconnect', () =>
    {
        const user = removeUser(socket.id);
        if (user)
        {
            io.to(user.room).emit('message', generateMessage(user.username, `${user.username} has left!`));
            io.to(user.room).emit('roomData', 
            {
                room: user.room,
                usersInRoom: getUsersInRoom(user.room)
            });
        }
    });
    
});

server.listen(port, () =>
{
    console.log(`Listening on port ${port}`);
})