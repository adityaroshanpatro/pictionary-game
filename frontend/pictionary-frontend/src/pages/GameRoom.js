import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your backend URL

const Lobby = () => {
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const createRoom = async () => {
        try {
            const response = await fetch('http://localhost:5000/create-room', { method: 'POST' });
            const data = await response.json();
            const newRoomId = data.roomId;
            setRoomId(newRoomId); // Display the Room ID in the frontend
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Failed to create room. Please try again.');
        }
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            alert('Please enter a room ID and username');
            return;
        }
        socket.emit('join-room', JSON.stringify({ roomId, username }));
        navigate(`/game/${roomId}`);
    };

    return (
        <div className="lobby">
            <h1>Pictionary Game</h1>
            <div>
                <button onClick={createRoom}>Create Room</button>
                {roomId && (
                    <p>Your Room ID: <span style={{ color: 'blue', fontWeight: 'bold' }}>{roomId}</span></p>
                )}
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button onClick={joinRoom}>Join Room</button>
            </div>
        </div>
    );
};

export default Lobby;
