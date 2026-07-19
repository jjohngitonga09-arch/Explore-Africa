import { Server as SocketServer } from "socket.io";
import type { Server as HttpServer } from "http";

let _io: SocketServer | null = null;

export function initSocket(httpServer: HttpServer): SocketServer {
  _io = new SocketServer(httpServer, {
    path: "/api/socket.io",
    cors: { origin: "*", methods: ["GET", "POST"] },
  });
  _io.on("connection", (_socket) => {
    // clients auto-join gallery room; no auth required for gallery reads
  });
  return _io;
}

export function getIO(): SocketServer {
  if (!_io) throw new Error("Socket.io not initialized");
  return _io;
}
