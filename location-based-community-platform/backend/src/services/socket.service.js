let ioInstance = null;

function setSocketServer(io) {
  ioInstance = io;
}

function notify(event, payload) {
  try {
    if (!ioInstance) return;
    ioInstance.emit(event, payload);
  } catch (error) {
    console.warn("Socket notification skipped:", error.message);
  }
}

module.exports = { setSocketServer, notify };
