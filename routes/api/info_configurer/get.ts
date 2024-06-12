import Elysia from "elysia";
import type { WorkshopInfo } from "../../../utils/types";
import type { v1Prefix } from "../../../utils/vars";

const placeholder: WorkshopInfo = {
    title: "Own Workshop",
    description: "Self-hosted workshop",
    headerimage: "assets/banner.png"
}

const INFO_CONFIG_API = new Elysia({
    prefix: "/v1/info" as v1Prefix
})
    .get("/get", () => {
        return placeholder;
    }, {
        tags: ["API", "INFO"]
    })

export default INFO_CONFIG_API;

