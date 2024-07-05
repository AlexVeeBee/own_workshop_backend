import Elysia, { t } from "elysia";
import type { v1Prefix } from "../../../utils/vars";

const ROUTE_UPLOAD = new Elysia({
    prefix: "/v1/upload" as v1Prefix
})
    .post("/extractTags", async (ctx) => {
        console.log(ctx);
        log.success("File received");
        // const arrayBuffer = await file.arrayBuffer();
        return {
            tags: ["tag1", "tag2"]
        }
    },{ body: t.File({ type: "image" })})
    .get("/extractTags", async ({}) => {
        return {
            tags: ["tag1", "tag2"]
        }
    })
export default ROUTE_UPLOAD;
