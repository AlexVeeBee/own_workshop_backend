import Elysia from "elysia";

import { t } from "elysia";
import fs from "fs";
import path from "path";
import { assetspath } from "./get";
import type { v1Prefix } from "../../../utils/vars";

const API_ASSET_UPLOADER = new Elysia()
    .post("/upload", async ({body: { file },}) => {
        return new Response("Not implemented", { status: 501 });
    }, {
        // description: "Upload a file",
        body: t.Object({
            file: t.File(),
        }),
        responses: {
            200: t.Object({
                message: t.String(),
            }),
            400: t.Object({
                message: t.String(),
            }),
        },
    })

export default API_ASSET_UPLOADER;