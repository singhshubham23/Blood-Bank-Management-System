import { Server } from "socket.io";
import { Types } from "mongoose";

let io: Server | null = null;

export const setIo = (socketIoInstance: Server): void => {
  io = socketIoInstance;
};

export const getIo = (): Server | null => {
  return io;
};

export const emitInventoryUpdate = (data: any, targetOrgId: string | Types.ObjectId | null = null): void => {
  if (!io) return;
  const room = targetOrgId ? `inventory_${targetOrgId}` : "inventory_global";
  io.to(room).emit("inventory:update", data);
};

export const emitRequestUpdate = (data: any, targetUserId: string | Types.ObjectId): void => {
  if (!io) return;
  io.to(`user_${targetUserId}`).emit("request:update", data);
};
