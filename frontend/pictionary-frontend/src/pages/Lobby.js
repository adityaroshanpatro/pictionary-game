import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your backend URL

const Lobby = () => {
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const createRoom = () => {
        socket.emit('create-room', {}, (response) => {
            const newRoomId = response.roomId;
            setRoomId(newRoomId);
            navigate(`/game/${newRoomId}`);
        });
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            alert('Please enter a room ID and username');
            return;
        }
        navigate(`/game/${roomId}`);
    };

    return (
        <div className="lobby">
            <h1>Pictionary Game</h1>
            <div>
                <button onClick={createRoom}>Create Room</button>
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
