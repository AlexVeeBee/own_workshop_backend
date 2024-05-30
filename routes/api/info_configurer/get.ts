import Elysia from "elysia";
import type { WorkshopInfo } from "../../../utils/types";

const placeholder: WorkshopInfo = {
    title: "Own Workshop",
    description: "Self-hosted workshop",
    headerimage: "assets/banner.png"
}

const INFO_CONFIG_API = new Elysia()
    .get("/api/info/get", () => {
        return placeholder;
    }, {
        tags: ["API", "INFO"]
    })

export default INFO_CONFIG_API;

