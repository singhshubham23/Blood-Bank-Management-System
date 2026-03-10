let io = null;

function setSocket(socketInstance) {
  io = socketInstance;
}

function emitInventoryUpdate(updatedInv, orgId = null) {
  if (!io) return;
  const room = orgId ? `inventory_${orgId}` : "inventory_global";
  io.to(room).emit("inventory:update", updatedInv);
  console.log(`🔴 Inventory update emitted to: ${room}`);
}

module.exports = { setSocket, emitInventoryUpdate };
