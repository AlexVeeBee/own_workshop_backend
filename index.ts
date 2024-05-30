import "./utils/logger";
import Elysia from "elysia";
import staticPlugin from "@elysiajs/static";
import swagger from "@elysiajs/swagger";
import ROUTE_API from "./routes/api";
const port = process.env.PORT || 8080;
log.log("Starting the workshop...");

if (typeof Bun === "undefined") {
    // this code will only run when the file is run with Bun
    throw new Error("This file is not meant to be run with Bun!");        
}  
    
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
// env
// log.error("An error occurred!");
// log.info("Informational message!");
// await Bun.build({
//     entrypoints: ['./src/react/index.tsx'],
//     outdir: './public',
// });
// other unhandled errors
process.on("error", (error) => {
    log.error("An error occurred!");
    log.error(error);
});
new Elysia()
    .state("author", "AlexVeeBee")
    .state("version", "1.0.0")
    .decorate("logger", log)
    .use(staticPlugin({
        assets: "assets",
        prefix: "/assets",
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
    .listen(port, () => {
        log.info(`Server is running on port ${port}
        > http://localhost:${port}
        `);
    });