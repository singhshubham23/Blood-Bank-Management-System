import { Server } from "socket.io";
import http from "http";

function initSocket(server: http.Server): Server {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PATCH"],
      credentials: true
    },
    transports: ["websocket", "polling"]
  });

  io.on("connection", (socket) => {
    console.log("✔ Socket connected:", socket.id);

    socket.on("subscribeInventory", ({ orgId }: { orgId?: string } = {}) => {
      const room = orgId ? `inventory_${orgId}` : "inventory_global";
      socket.join(room);
      console.log(`📌 Socket joined room: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log("✖ Socket disconnected:", socket.id);
    });
  });

  (io as any).emitInventoryUpdate = function (updatedInv: any, orgId: string | null = null) {
    const room = orgId ? `inventory_${orgId}` : "inventory_global";
    io.to(room).emit("inventory:update", updatedInv);
    console.log(`🔴 Emitted inventory update to ${room}`);
  };

  return io;
}

export default initSocket;
