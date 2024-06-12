export type AssetProperties = 
    | "ASSETSPATH" 
    | "CSS" 
    | "VISIBILITY"
    | "MISSINGMANIFEST"
    ;

export type IUser = {
    id: string | number;
    username: string;
    pfp: string | null;
    banner?: string | null;
    admin?: boolean;
    nsfw?: boolean;
    roles?: string[];
    created: Date;
}

export interface AssetMedia {
    type: 
        | null
        | "image"
        | "video"
        | "audio"
        | "unknown"
    src: string;
    smallSrc?: string | null;
}

interface IAssetLimits {
    name: string;
}
export interface Asset {
    id: number;
    name: string;
    description?: string[];
    shortDescription?: string;
    tags: string[];
    thumb: string;
    media?: AssetMedia[] | string[] | undefined | null;
    owner: IUser | string;
    authors: IUser[];
    latestVersion?: string | null
    limits?: string[];
    nsfw: boolean;
    created?: Date;
    updated?: Date;
    properties?: {
        [key in AssetProperties]?: string | boolean | null;
    }
}

export interface AssetVersion {
    version: string,
    date: Date,
}


export interface WorkshopInfo {
    title: string;
    description: string;
    headerimage: string;
}

export interface IBanInfo {
    id: string;
    reason: string;
    date: Date;
    expires: Date;
    bannedBy: IUser;
    bannedUser: IUser;
}