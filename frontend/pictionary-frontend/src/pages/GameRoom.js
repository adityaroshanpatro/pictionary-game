import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your backend URL

const GameRoom = () => {
    const { roomId } = useParams();
    const [username, setUsername] = useState('');
    const [messages, setMessages] = useState([]);
    const [guess, setGuess] = useState('');
    const [drawingData, setDrawingData] = useState([]);
    const canvasRef = useRef(null);

    useEffect(() => {
        socket.emit('join-room', JSON.stringify({ roomId, username }));

        socket.on('drawing', (data) => {
            setDrawingData((prev) => [...prev, data]);
        });

        socket.on('new-guess', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.emit('leave-room', JSON.stringify({ roomId, username }));
        };
    }, [roomId, username]);

    const handleGuess = () => {
        socket.emit('guess-word', { roomId, username, guess });
        setGuess('');
    };

    const handleDraw = (e) => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.arc(e.clientX, e.clientY, 5, 0, 2 * Math.PI);
        ctx.fill();
        socket.emit('draw', JSON.stringify({ roomId, drawingData: { x: e.clientX, y: e.clientY } }));
    };

    return (
        <div className="game-room">
            <h1>Room: {roomId}</h1>
            <canvas ref={canvasRef} width={800} height={600} onMouseMove={handleDraw}></canvas>
            <div>
                <h2>Chat</h2>
                <div>
                    {messages.map((msg, idx) => (
                        <p key={idx}>{msg}</p>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Enter your guess"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                />
                <button onClick={handleGuess}>Submit</button>
            </div>
        </div>
    );
};

export default GameRoom;
