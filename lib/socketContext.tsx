
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  locks: Record<string, any>; // Map of sectionId -> LockData
  onlineUsers: number;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket] = useState<Socket>(() => io('/', {
      path: '/socket.io',
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
  }));
  const [isConnected, setIsConnected] = useState(false);
  const [locks, setLocks] = useState<Record<string, any>>({});
  const [onlineUsers, setOnlineUsers] = useState<number>(0);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('⚡ Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('⚡ Socket disconnected');
      setIsConnected(false);
      setLocks({}); // Reset locks on disconnect
    });

    // Compteur utilisateurs en ligne
    socket.on('online_users_count', (count: number) => {
        setOnlineUsers(count);
    });

    // Gestion des verrous
    socket.on('current_locks', (currentLocks: any) => {
        setLocks(currentLocks);
    });

    socket.on('section_locked', ({ sectionId, lockData }: any) => {
        setLocks(prev => ({ ...prev, [sectionId]: lockData }));
    });

    socket.on('section_unlocked', ({ sectionId }: any) => {
        setLocks(prev => {
            const newLocks = { ...prev };
            delete newLocks[sectionId];
            return newLocks;
        });
    });

    return () => {
      socket.close();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, locks, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
