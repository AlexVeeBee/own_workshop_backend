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

export interface Asset {
    id: number;
    name: string;
    description?: string;
    tags: string[];
    thumb: string;
    images?: string[];
    authors: IUser[];
    properties?: {
        [key in AssetProperties]?: string;
    }
}


export interface WorkshopInfo {
    title: string;
    description: string;
    headerimage: string;
}