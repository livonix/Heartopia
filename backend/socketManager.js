
const { Server } = require('socket.io');

let io;
const sectionLocks = new Map();
// Set pour suivre les admins connectés: ID de l'utilisateur (DB)
const connectedAdmins = new Set();

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Client connecté: ${socket.id}`);

        io.emit('online_users_count', io.engine.clientsCount);
        socket.emit('current_locks', Object.fromEntries(sectionLocks));

        // Un admin s'identifie
        socket.on('register_admin', (adminId) => {
            socket.adminId = adminId;
            connectedAdmins.add(adminId);
            io.emit('admin_status_update', Array.from(connectedAdmins));
        });

        // Demande de statut (pour le client qui charge la page)
        socket.on('check_admin_status', () => {
            socket.emit('admin_status_update', Array.from(connectedAdmins));
        });

        socket.on('typing_start', ({ userId, role }) => {
            io.emit(`support_typing_${userId}`, { isTyping: true, role });
        });

        socket.on('typing_end', ({ userId, role }) => {
            io.emit(`support_typing_${userId}`, { isTyping: false, role });
        });

        socket.on('lock_section', ({ sectionId, user }) => {
            const existingLock = sectionLocks.get(sectionId);
            if (existingLock && existingLock.userId !== user.id) {
                socket.emit('lock_error', { message: `Cette section est déjà en cours d'édition par ${existingLock.username}` });
                return;
            }
            const lockData = {
                userId: user.id,
                username: user.username,
                socketId: socket.id,
                timestamp: Date.now()
            };
            sectionLocks.set(sectionId, lockData);
            io.emit('section_locked', { sectionId, lockData });
        });

        socket.on('unlock_section', ({ sectionId }) => {
            const lock = sectionLocks.get(sectionId);
            if (lock && lock.socketId === socket.id) {
                sectionLocks.delete(sectionId);
                io.emit('section_unlocked', { sectionId });
            }
        });

        socket.on('disconnect', () => {
            console.log(`❌ Client déconnecté: ${socket.id}`);
            io.emit('online_users_count', io.engine.clientsCount);

            if (socket.adminId) {
                connectedAdmins.delete(socket.adminId);
                io.emit('admin_status_update', Array.from(connectedAdmins));
            }

            for (const [sectionId, lock] of sectionLocks.entries()) {
                if (lock.socketId === socket.id) {
                    sectionLocks.delete(sectionId);
                    io.emit('section_unlocked', { sectionId });
                }
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIO };
