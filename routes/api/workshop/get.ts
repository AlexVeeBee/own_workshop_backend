import Elysia, { t } from "elysia";
import sharp from "sharp";
// fs
import fs from "fs"
import type { Asset, AssetMedia, AssetVersion, IUser } from "../../../utils/types";
import { getUserBasic } from "../users/get";
import API_ASSET_UPLOADER from "./upload";
import type { v1Prefix } from "../../../utils/vars";
export const assetspath = "assets/items";
const assetTemplate: Asset = {
    id: 0,
    name: "Asset",
    description: [""],
    shortDescription: "",
    tags: [],
    thumb: "",
    media: [],
    authors: [],
    owner: "",
    nsfw: false,
    properties: {
        CSS: "",
    }
}

// const ScaleDownImage = (path: string, width: number, height: number) => {
//     const buffer = fs.readFileSync(path);

//     return sharp(buffer)
//         .resize(width, height)
//         .toBuffer();
// }


const GenerateSmallImages = async (path: string, blur: boolean = false ) => {
    return await new Promise(async (resolve, reject) => {
        let generatedCount = 0;
        if (!fs.existsSync(path)) {
            log.warn(`Path ${path} does not exist!`);
            resolve(false);
            return;
        }
        const read = fs.readdirSync(path);
        let sort = read.sort((a, b) => {
            return a.localeCompare(b);
        });

        const smallpath = `${path}/small`;
        if (!fs.existsSync(smallpath)) {
            fs.mkdirSync(smallpath);
        } else {
            // remove all files
            const files = fs.readdirSync(smallpath);
            files.forEach(file => {
                fs.unlinkSync(`${smallpath}/${file}`);
            });
        }

        // ignore folders
        sort = sort.filter(file => {
            const stat = fs.statSync(`${path}/${file}`);
            return !stat.isDirectory();
        });

        sort.forEach(async (file, i) => {
                const type = getMediaType(file);
                if (type === "image") {
                    const buffer = fs.readFileSync(`${path}/${file}`);
                    const image = sharp(buffer);

                    // get aspect ratio
                    const metadata = await image.metadata();
                    if (!metadata) {
                        reject("Failed to get metadata for image");
                        return;
                    }
                    const width = metadata.width || 16;
                    const height = metadata.height || 9;
                    const ratio = width / height;
                    const pixels = 128;

                    image.resize(pixels, Math.floor(pixels / ratio));

                    if (blur) {
                        image.blur(16);
                    }

                    image.toFile(`${smallpath}/${file}`, (err, info) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        log.success(`Generated small image for ${file}`);
                        generatedCount++;
                        if (generatedCount === sort.length) {
                            log.success(`Generated small images for ${path}`);
                            resolve(true);
                        }
                    });
                }
        })
    });
}

const getSmallImage = (id: number, filename: string) => {
    const path = `${assetspath}/${id}/images/small/${filename}`;
    if (!fs.existsSync(path)) {
        console.log("not found");
        return null; 
    }
    return path;
}

let getImagesCache = new Map<number, AssetMedia[]>();

const getImages = async (id: number, assetinfo?: Asset): Promise<AssetMedia[]> => {
    const path = `${assetspath}/${id}/images`;
    if (!fs.existsSync(path)) {
        return [];
    }

    // check if the cache has the images
    if (getImagesCache.has(id)) {
        log.success(`Using cache for asset ${id}`);
        return getImagesCache.get(id) as AssetMedia[];
    }

    const read = fs.readdirSync(path);

    // remove directories from the list
    let sort = read.filter(file => {
        const stat = fs.statSync(`${path}/${file}`);
        return !stat.isDirectory();
    })

    // sort the files
    sort = sort.sort((a, b) => {
        return a.localeCompare(b);
    });

    await GenerateSmallImages(path, assetinfo?.nsfw);

    const media: AssetMedia[] = [];
    sort.forEach(file => {
        const type = getMediaType(file);
        if (type) {
            media.push({
                type,
                src: `${path}/${file}`,
                smallSrc: getSmallImage(id, file),
            });

        }
    });

    getImagesCache.set(id, media);
    log.success(`Added asset ${id} to cache`);
    setTimeout(() => {
        getImagesCache.delete(id);
        log.warn(`Removed asset ${id} from cache`);
    }, 1000 * 60 * 5); // 5 minutes
    return media;
}
const checkTags = (tags: string[], word: string | string[]) => {
    if (typeof word === "string") {
        return tags.includes(word);
    }
    return word.some(w => tags.includes(w));
}
const getThumb = (id: number) => {
    const path = `${assetspath}/${id}`;
    const thumb = fs.readdirSync(path).find(file => file.match(/thumb\.(jpg|jpeg|png|gif)/));
    if (thumb) {
        return `${path}/${thumb}`;
    }
    return null;
}
const GetManifest = (id: number): Asset => {
    const path = `${assetspath}/${id}/manifest.json`;
    if (fs.existsSync(path)) {
        return JSON.parse(fs
            .readFileSync(path)
            .toString());
    }
    return {
        ...assetTemplate,
        id,
        properties: {
            ...assetTemplate.properties,
            MISSINGMANIFEST: true,
        }
    };
}

const types_video = ["mp4", "webm", "ogg"];
const types_image = ["jpg", "jpeg", "png", "gif"];

const getMediaType = (file: string) => {
    if (!file) return;
    const ext = file.split(".").pop();
    if (!ext) return;
    if (types_image.includes(ext)) {
        return "image";
    }
    if (types_video.includes(ext)) {
        return "video";
    }
    return "unknown";
}

const ListAssets = async () => {
    const list: Asset[] = [];
    const read = fs.readdirSync(assetspath);

    // sort the directories
    read.sort((a, b) => {
        return a.localeCompare(b);
    });

    await new Promise((resolve, reject) => {
        read.forEach(async (dir, index) => {
            const path = `${assetspath}/${dir}`;
            const stat = fs.statSync(path);
            if (!stat.isDirectory()) {
                return;
            }
            let info: Asset = await GetManifest(parseInt(dir));
            if (info.properties?.MISSINGMANIFEST) {
                // create a new asset
                info = { ...assetTemplate };
                info.id = parseInt(dir);
                info.name = `Asset ${info.id}`;
                info.description = [
                    "# Missing manifest",
                    "There is no manifest file for this asset.",
                    "- Please create a manifest file for this asset.",
                ]
                info.shortDescription = `Missing manifest file. Asset ${info.id}`;
                info.tags = ["SFW/NSFW", "Not configured"];
            }
            const nsfw = checkTags(info.tags, ["NSFW", "18+", "+18", "Explicit"]);
            info.nsfw = nsfw;
            // generate small images
            // await GenerateSmallImages([path], nsfw);

            // check if the author is missing
            if (info.authors) {
                info.authors = info.authors.map((id: any) => {
                    const num = parseInt(id);
                    return getUserBasic(num);
                });
            }

            if (info.owner) {
                info.owner = getUserBasic(parseInt(info.owner as string));
            }

            if (info.authors && info.authors.length === 0) {
                // @ts-expect-error
                info.authors = null;
                info.limits = [
                    "disable-comments",
                    "disable-config",
                ]
            }

            if (info) {
                const thumb = getThumb(parseInt(dir));
                if (!thumb) {
                    return;
                }
                info.thumb = thumb;
                // info.latestVersion = versionGetLatest(info.id);
                list.push(info);
            }
        });
        resolve(true);
    })

    // sort by id if available
    list.sort((a, b) => {
        return a.id - b.id;
    });

    return list;
}

export const assetsPlaceholder = await ListAssets();

const addZero = (num: number) => {
    return num < 10 ? `0${num}` : num;
}

const formatDate = (date: Date) => {
    // format the date to "YYYY-MM-DD HH:MM:SS"
    const d = date.getDate();
    const m = date.getMonth();
    const y = date.getFullYear();
    const h = date.getHours();
    const min = date.getMinutes();
    const s = date.getSeconds();

    return `${d} / ${m} / ${y} ${h}:${addZero(min)}:${addZero(s)}`;
}

const comments_placeholder: {
    id: number,
    user: IUser,
    comment: string,
    date: string,
}[] = [
    {
        id: 0,
        user: getUserBasic(1),
        comment: "This is a placeholder comment.",
        date: formatDate(new Date()),
    },
    {
        id: 1,
        user: getUserBasic(2),
        comment: `
# AMAZING!        
Pretty cool asset!`,
        date: formatDate(new Date()),
    }
]

const getSingleAsset = async (id: number): Promise<Asset | null> => {
    const path = `${assetspath}/${id}`;
    if (!fs.existsSync(path)) {
        log.error(`Asset ${id} not found! Folder does not exist.`);
        return null;
    }
    const info = GetManifest(id);
    if (!info) {
        log.warn(`Manifest not found for asset ${id}. Creating a temporary one.`);
    }
    if ( info.properties?.MISSINGMANIFEST ) {
        info.name = `Asset ${id}`;
        info.description = [
            "# Missing manifest",
            "There is no manifest file for this asset.",
            "- Please create a manifest file for this asset.",
        ]
        info.shortDescription = `Missing manifest file. Asset ${info.id}`;
        info.tags = ["SFW/NSFW", "Not configured"];
    }
    const nsfw = checkTags(info.tags || [], ["NSFW", "18+", "+18", "Explicit"]);
    info.nsfw = nsfw;
    // generate small images
    log.success("Checks passed")
    if (info.authors) {
        info.authors = info.authors.map((id: any) => {
            const num = parseInt(id);
            return getUserBasic(num);
        });
    }

    if (info.owner) {
        info.owner = getUserBasic(parseInt(info.owner as string));
    }

    if (info.authors && info.authors.length === 0) {
        info.authors = [];
        info.limits = [
            "disable-comments",
            "disable-config",
        ]
    }

    const thumb = getThumb(id);
    if (!thumb) {
        log.warn("Thumb not found for asset", id)
        return null;
    }
    info.thumb = thumb;
    info.media = await getImages(id, info);
    info.latestVersion = versionGetLatest(info.id);
    return info;
}

const versionCheck = (id: number, version: string) => {
    const path = `${assetspath}/${id}/versions/${version}.zip`;
    return fs.existsSync(path);
}

const versionGetLatest = (id: number) => {
    const path = `${assetspath}/${id}/versions`;
    if (!fs.existsSync(path))
        return null;
    const read = fs.readdirSync(path, { withFileTypes: true });
    const versions = read.filter(file => file.isFile()).map(file => file.name);
    if (versions.length === 0) {
        return null;
    }

    const latest = versions.sort((a, b) => {
        return a.localeCompare(b);
    }).pop();

    // remove the .zip extension
    // keep 1.0.0 instead of 1.0.0.zip
    if (latest) {
        return latest.replace(".zip", "");
    }
    return latest;
}

const getAssetVersions = async (id: number): Promise<AssetVersion[]> => {
    const path = `${assetspath}/${id}/versions`;
    if (!fs.existsSync(path)) return [];
    const list: AssetVersion[] = [];
    const read = fs.readdirSync(path);
    const versions = read.filter(file => file.match(/\.zip$/)).map(file => file.replace(".zip", ""));
    versions.forEach(version => {
        const stat = fs.statSync(`${path}/${version}.zip`);
        list.push({
            version,
            date: stat.mtime,
        });
    });

    return list;
}

const WORKSHOP_API = new Elysia({
    prefix: "/v1/workshop" as v1Prefix,
})
    .get("/", () => {
        const item = assetsPlaceholder.map(asset => {
            return {
                id: asset.id,
                name: asset.name,
                description: asset.description,
                shortDescription: asset.shortDescription,
                thumb: asset.thumb,
                tags: asset.tags,
            }
        });
        return item;
    }, {
        tags: ["API", "Workshop"]
    })
    .get("/get/:id", async ({ params: { id } }) => {
        try {
            let asset = await getSingleAsset(parseInt(id));
            if (!asset) {
                log.error(`Asset id ${id} was not found!`);
                return new Response("NOT_FOUND", { status: 404 });
            }
            return asset;
        } catch (e) {
            log.error(e);
            return new Response("ERROR", { status: 500 });
        }
    }, {
        tags: ["API", "Workshop"],
    })
    .get("/get/:id/comments", async ({ params: { id } }) => {
        return comments_placeholder;
    }, {
        tags: ["API", "Workshop"],
    })
    .get("/get/:id/versions", async ({ params: { id } }) => {
        const a = await getAssetVersions(parseInt(id));
        // sort the versions by date
        a.sort((a, b) => {
            return a.date.getTime() - b.date.getTime();
        });
        a.reverse();
        return a;
    }, {
        tags: ["API", "Workshop"],
    })
    .get("/download/:id/zip/latest", async ({ params: { id } }) => {
        const latest = versionGetLatest(parseInt(id));
        if (!latest) {
            return new Response("NO_LATEST_VERSIONS_AVAILABLE", { status: 404 });
        }
        log.info(`Sending ZIP file for asset ${id} version ${latest}`);
        return new Response(Bun.file(`${assetspath}/${id}/versions/${latest}.zip`), {
            headers: {
                "Content-Type": "application/zip",
            }
        });
    }, {
        detail: {
            description: "Download the latest version of this asset as a ZIP file.",
        },
        params: t.Object({
            id: t.String(),
        }),
        tags: ["API", "Workshop"],
    })
    .get("/download/:id/zip/:version", async ({ params: { id, version } }) => {
        log.info(`Specific donwload for asset ${id} version ${version}`);
        if (!versionCheck(parseInt(id), version)) {
            log.error(`Version ${version} not found for asset ${id}`);
            return new Response(`VERSION_${version}_NOT_FOUND`, { status: 404 });
        }
        return new Response(Bun.file(`${assetspath}/${id}/versions/${version}.zip`), {
            headers: {
                "Content-Type": "application/zip",
            }
        });
    }, {
        detail: {
            description: "Download the a curtain version of this asset as a ZIP file.",
        },
        params: t.Object({
            id: t.String(),
            version: t.String({
                description: "The version of the asset to download.",
            }),
        }),
        tags: ["API", "Workshop"],
    })
    .use(API_ASSET_UPLOADER)
    // .get("/api/workshop/download/:id/file", 
    // async ({ 
    //     params: { id }, 
    //     query: { path }
    // }) => {
    //     console.log(path);
    //     return new Response(`NOT_IMPLEMENTED: ${path}`, { status: 501 })
    // }, {
    //     detail: {
    //         description: "Download a file from the asset.",
    //     },
    //     params: t.Object({
    //         id: t.String(),
    //     }),
    //     query: t.Object({
    //         path: t.String(),
    //     }),
    //     tags: ["API", "Workshop"],
    // })
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