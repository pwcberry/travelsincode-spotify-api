import * as td from "testdouble";

export default function createMockSocket() {
  const mockSocket = {
    get readable() {
      return true;
    },
    get writeable() {
      return true;
    },
    destroyed: false,
    _readableState: {
      ended: false,
      flowing: false,
    },
    listeners: {},
    on: td.func((event, listener) => {
      if (!(event in mockSocket.listeners)) {
        mockSocket.listeners[event] = [];
      }
      mockSocket.listeners[event].push(listener);
    }),
    emit: td.func((event, ...args) => {
      if (event in mockSocket.listeners) {
        mockSocket.listeners[event].forEach((listener) => listener(...args));
      }
      if (event === "data") {
        mockSocket.flowing = true;
      } else if (event === "end" || event === "close") {
        mockSocket.flowing = false;
        mockSocket.ended = true;
      }
    }),
    destroy: td.func(() => {
      mockSocket.destroyed = true;
      mockSocket.emit("close");
    }),
    removeAllListeners: td.func((event) => {
      if (event) {
        delete mockSocket.listeners[event];
      } else {
        mockSocket.listeners = {};
      }
    }),
  };

  return mockSocket;
}
