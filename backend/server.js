const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins for development
        methods: ["GET", "POST"],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for rooms
const rooms = {};

// Endpoint to create a room
app.post('/create-room', (req, res) => {
    const roomId = Math.random().toString(36).substr(2, 6); // Generate a unique room ID
    rooms[roomId] = { players: [], currentDrawer: null, currentWord: null };
    console.log(`Room created: ${roomId}`, rooms[roomId]);
    res.json({ roomId });
});

// Endpoint to get room details (for debugging)
app.get('/room/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    if (rooms[roomId]) {
        console.log(`Room details fetched for roomId: ${roomId}`, rooms[roomId]);
        res.json(rooms[roomId]);
    } else {
        console.log(`Room with ID ${roomId} not found`);
        res.status(404).json({ message: 'Room not found' });
    }
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle joining a room
    socket.on('join-room', (data) => {
        console.log('join-room event received:', data);
        data = JSON.parse(data)
        // Validate payload
        const { roomId, username } = data || {}; // Handle missing or undefined payload

        if (!roomId || !username) {
            console.error('Invalid payload: roomId or username is undefined');
            socket.emit('error', 'Invalid payload: roomId and username are required');
            return;
        }
    
        console.log(`Processing join-room: roomId=${roomId}, username=${username}`);
        console.log('Current rooms:', rooms);
    
        if (!rooms[roomId]) {
            console.error(`Room with ID ${roomId} does not exist`);
            socket.emit('error', `Room with ID ${roomId} does not exist. Please create or join a valid room.`);
            return;
        }
    
        // Add player to the room
        rooms[roomId].players.push(username);
        socket.join(roomId);
        console.log(`${username} joined room ${roomId}`);
        console.log('Updated room details:', rooms[roomId]);
    
        // Notify others in the room
        io.to(roomId).emit('player-joined', { username, players: rooms[roomId].players });
    });

    // Handle leaving a room
    socket.on('leave-room', ({ roomId, username }) => {
        console.log(`leave-room event received: roomId=${roomId}, username=${username}`);
        console.log('Current rooms before leaving:', rooms);

        if (!rooms[roomId]) {
            console.error(`Room with ID ${roomId} does not exist`);
            return;
        }

        // Remove player from the room
        rooms[roomId].players = rooms[roomId].players.filter(player => player !== username);
        socket.leave(roomId);
        console.log(`${username} left room ${roomId}`);
        console.log('Updated room details:', rooms[roomId]);

        // Notify remaining players in the room
        io.to(roomId).emit('player-left', { username, players: rooms[roomId].players });
    });

    // Handle drawing
    socket.on('draw', ({ roomId, drawingData }) => {
        console.log(`draw event received for roomId=${roomId}:`, drawingData);
        if (!rooms[roomId]) {
            console.error(`Room with ID ${roomId} does not exist`);
            return;
        }
        socket.to(roomId).emit('drawing', drawingData); // Broadcast drawing data to others
    });

    // Handle clearing the canvas
    socket.on('clear-canvas', (roomId) => {
        console.log(`clear-canvas event received for roomId=${roomId}`);
        if (!rooms[roomId]) {
            console.error(`Room with ID ${roomId} does not exist`);
            return;
        }
        io.to(roomId).emit('canvas-cleared'); // Notify all players in the room
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
