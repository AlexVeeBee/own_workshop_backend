const RESET = "\x1b[0m";

class Logger {
    constructor() {}

    globalstyle = "border-radius: 5px; padding: 0 5px;"

    types = {
        log: '\x1b[32m',
        error: '\x1b[31m',
        warn: '\x1b[33m',
        info: '\x1b[36m',
    };

    currentTime() {
        const date = new Date().toLocaleTimeString();
        return `[${date}]`;
    }

    logstart(type: string) {
        return `${this.currentTime()} [${type.toUpperCase()}]`;
        // console.groupCollapsed(`%c${DEBUG_PREFIX} ${this.currentTime()} [${type}]`, this.types[type]);
    }

    log(...args: any[]) {
        console.log(this.types.log, `${this.logstart("log")}`, RESET,...args);
    }

    error(...args: any[]) {
        console.error(this.types.error, `${this.logstart("error")}`, RESET,...args);
    }

    warn(...args: any[]) {
        console.warn(this.types.warn, `${this.logstart("warn")}`, RESET,...args);
    }

    info(...args: any[]) {
        console.info(this.types.info, `${this.logstart("info")}`, RESET,...args);
    }
}

export default Logger;
