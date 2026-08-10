import { Server } from 'socket.io';

let io = null;

/**
 * Initialize Socket.IO on the given HTTP server
 * @param {object} server - HTTP server instance
 * @returns {Server} Socket.IO instance
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get the initialized Socket.IO instance
 * @returns {Server}
 */
export const getIO = () => {
  return io;
};

/**
 * Broadcast updated machine state to all connected clients
 * @param {object} machine - Machine Mongoose document or object
 */
export const emitMachineUpdate = (machine) => {
  if (io) {
    io.emit('machineUpdate', machine);
  }
};
