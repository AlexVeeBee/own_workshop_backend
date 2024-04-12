import { html } from "@elysiajs/html";
import Elysia from "elysia";
import App from "../../src/react/App";
import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";

const index = new Elysia()
    .use(html())
    .get("/", async () => {
        // @ts-ignore
        const app = createElement(App);

        const stream = await renderToReadableStream(app, {
            bootstrapScripts: ['/public/index.js']
        })
      
        return new Response(stream, {
            headers: {
                "Content-Type": "text/html"
            }
        });
    });

export default index;