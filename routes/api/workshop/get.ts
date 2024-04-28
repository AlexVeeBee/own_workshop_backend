import Elysia, { t } from "elysia";
// fs
import fs from "fs"
import type { Asset, User } from "../../../utils/types";
import { getUserBasic } from "../users/get";
const assetspath = "assets/items";
const assetTemplate: Asset = {
    id: 0,
    name: "Asset",
    description: "",
    tags: [],
    thumb: "",
    images: [],
    authors: [],
    properties: {
        CSS: "",
    }
}

const getImages = (id: number) => {
    const path = `${assetspath}/${id}/images`;
    if (!fs.existsSync(path)) {
        return [];
    }
    const read = fs.readdirSync(path);
    const sort = read.sort((a, b) => {
        return a.localeCompare(b);
    });
    return sort.map(file => `${path}/${file}`);
}
const getThumb = (id: number) => {
    const path = `${assetspath}/${id}`;
    const thumb = fs.readdirSync(path).find(file => file.match(/thumb\.(jpg|jpeg|png|gif)/));
    if (thumb) {
        return `${path}/${thumb}`;
    }
    return null;
}

const GetManifest = (id: number) => {
    const path = `${assetspath}/${id}/manifest.json`;
    if (fs.existsSync(path)) {
        return JSON.parse(fs
            .readFileSync(path)
            .toString());
    }
    return null;
}

const CheckJSONmissingKeys = (list: any, keys: string[]) => {
    let checks: any = {};
    list.forEach((item: any, index: number) => {
        keys.forEach(key => {
            if (!item[key]) {
                if (!checks[key]) {
                    checks[key] = [];
                }
                checks[key].push(index);
            }
        });
    });
    return checks;
}

const ListAssets = () => {
    const list: Asset[] = [];
    const read = fs.readdirSync(assetspath);
    read.forEach((dir, index) => {
        const path = `${assetspath}/${dir}`;
        const stat = fs.statSync(path);
        if (!stat.isDirectory()) {
            return;
        }
        let info: Asset = GetManifest(parseInt(dir));
        if (!info) {
            // create a new asset
            info = { ...assetTemplate };
            info.id = parseInt(dir);
            info.name = `Asset ${info.id}`;
            info.description = `Template for asset ${info.id}. There was no manifest file found for this asset.`;
            info.tags = ["SFW/NSFW", "Not configured"];
        }

        // check if the author is missing
        if (!info.authors) {
            info.authors = [
                {
                    id: 0,
                    username: "Unknown",
                    pfp: "assets/unknown.png",
                }
            ];
        } else {
            info.authors = info.authors.map((id: any) => {
                const num = parseInt(id);
                return getUserBasic(num);
            });
        }

        if (info) {
            const thumb = getThumb(parseInt(dir));
            if (!thumb) {
                return;
            }
            info.thumb = thumb;
            info.images = getImages(parseInt(dir));
            list.push(info);
        }
    });

    // sort by id
    list.sort((a, b) => {
        return a.id - b.id;
    });

    return list;
}

const placeholder = ListAssets();

const WORKSHOP_API = new Elysia()
    .get("/api/workshop", () => {
        const item = placeholder.map(asset => {
            return {
                id: asset.id,
                name: asset.name,
                description: asset.description,
                thumb: asset.thumb,
            }
        });
        return item;
    }, {
        tags: ["API", "Workshop"]
    })
    .get("/api/workshop/get/:id", async ({ params: { id } }) => {
        const asset = placeholder.find(asset => asset.id === parseInt(id));
        if (!asset) {
            log.error(`Asset id ${id} was not found!`);
            return new Response("NOT_FOUND", { status: 404 });
        }
        return asset;
    }, {
        tags: ["API", "Workshop"],
    })
    // .post("/api/workshop/upload", ({
    //     body
    // }) => {
    //     return new Response("NOT_IMPLEMENTED", { status: 501 });
    //     // const id = placeholder.length + 1;
    //     // const asset = { ...assetTemplate, id, ...body };
    //     // SaveAsJson(placeholder, id, `${assetspath}/${id}/manifest.json`);
    //     // placeholder.push(asset);
    //     // return asset;
    // }, {
    //     detail: {
    //         description: "Upload a new asset to the workshop.",
    //     },
    //     params: t.Object({
    //         id: t.Number(),
    //     }),
    //     response: t.Object({
    //         id: t.Number(),
    //         name: t.String(),
    //         description: t.String(),
    //         thumb: t.String(),
    //     }),
    // });

export default WORKSHOP_API;