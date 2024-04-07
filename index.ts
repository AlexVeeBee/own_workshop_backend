import Logger from "./utils/logger";
import Elysia from "elysia";
import { cors } from '@elysiajs/cors'

const port = 8080;
const log = new Logger();

declare global {
    var log: Logger;
}

globalThis.log = log;

log.log("Starting the workshop...");
// log.error("An error occurred!");
// log.info("Informational message!");
log.warn("Nothing has been done yet!");

const app = new Elysia();

app.get("/api/ping", ({}) => {
    return "pong";
})
    .use(cors());


app.get("/", ({
    params: { name }
}) => {
    return `Hello, ${name}!`;
});

app.listen(port, () => {
    log.info(`Server is running on port ${port}`);
});

