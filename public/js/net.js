// Socket.IO bağlantısı ve sayaç senkronu

export const socket = window.io({ transports: ['websocket', 'polling'] });

export const request = (ev, data) => new Promise((resolve) => socket.emit(ev, data, resolve));

/** Sunucudan gelen sayaç değerini yerelde akıtır */
export class Timer {
  constructor() {
    this.remaining = 0;
    this.rate = 0;
    this.at = performance.now();
  }
  sync({ remainingMs, rate }) {
    this.remaining = remainingMs;
    this.rate = rate;
    this.at = performance.now();
  }
  value() {
    return Math.max(0, this.remaining - (performance.now() - this.at) * this.rate);
  }
}
