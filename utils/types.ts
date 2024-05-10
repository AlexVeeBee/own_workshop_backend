export type AssetProperties = 
    | "ASSETSPATH" 
    | "CSS" 
    | "VISIBILITY"
    ;

export type IUser = {
    id: string | number;
    username: string;
    pfp: string | null;
    banner?: string | null;
}

export interface AssetMedia {
    type: 
        | null
        | "image"
        | "video"
        | "audio"
        | "unknown"
    src: string;
}

interface IAssetLimits {
    name: string;
}
export interface Asset {
    id: number;
    name: string;
    description?: string;
    tags: string[];
    thumb: string;
    media?: AssetMedia[] | string[] | undefined | null;
    authors: IUser[];
    owner: IUser | string;
    limits?: string[];
    properties?: {
        [key in AssetProperties]?: string;
    }
}


export interface WorkshopInfo {
    title: string;
    description: string;
    headerimage: string;
}