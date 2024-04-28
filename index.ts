import Logger from "./utils/logger";
import Elysia from "elysia";
import staticPlugin from "@elysiajs/static";
import swagger from "@elysiajs/swagger";
import ROUTE_API from "./routes/api";


const port = 8080;
const log = new Logger();

declare global {
    var log: Logger;
}

globalThis.log = log;

log.log("Starting the workshop...");

// env

console.log(process.env.CORS_ALLOW_ORIGIN);

// log.error("An error occurred!");
// log.info("Informational message!");

// await Bun.build({
//     entrypoints: ['./src/react/index.tsx'],
//     outdir: './public',
// });
  
// watch for unhanded rejections

process.on("unhandledRejection", (error) => {
    log.error("An unhandled rejection occurred!");
    log.error(error);
});

// watch for unhanded exceptions

process.on("uncaughtException", (error) => {
    log.error("An uncaught exception occurred!");
    log.error(error);
});

// other unhandled errors

process.on("error", (error) => {
    log.error("An error occurred!");
    log.error(error);
});

new Elysia()
    .use(staticPlugin({
        assets: "assets",
        prefix: "/assets"
    }))
    .use(swagger({
        version: "1.0.0",
        documentation: {
            info: {
                title: "Workshop API",
                description: "API for the workshop",
                version: "1.0.0",
            },
        }
    }))
    .use(ROUTE_API)
    .state("author", "AlexVeeBee")
    .state("version", "1.0.0")
    .listen(port, () => {
        log.info(`Server is running on port ${port}
        > http://localhost:${port}
        `);
    });

