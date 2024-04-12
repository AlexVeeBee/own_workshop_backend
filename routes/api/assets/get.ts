import Elysia from "elysia";

const placeholder = [
    {
        id: 1,
        name: "Asset 1",
        description: "This is the first asset"
    },
    {
        id: 2,
        name: "Asset 2",
        description: "This is the second asset"
    },
    {
        id: 3,
        name: "The workmanship of risk",
        description: "Risks are the potential events that can cause harm to the project objectives. The workmanship of risk is the process of identifying, analyzing, and responding to risks."
    }
]

const ASSETS_API = new Elysia()
    .get("/api/assets", () => {
        log.info("Assets API was called!");
        return placeholder;
    })
    .get("/api/assets/get/:id", ({
        params: { id }
    }) => {
        log.info(`Asset with id ${id} was requested!`);
        const asset = placeholder.find(asset => asset.id === parseInt(id));
        if (!asset) {
            return {
                error: "Asset not found!"
            }
        }
        return asset;
    });

export default ASSETS_API;