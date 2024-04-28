export type AssetProperties = 
    | "ASSETSPATH" 
    | "CSS" 
    | "VISIBILITY"
    ;

export type User = {
    id: string | number;
    username: string;
    pfp: string | null;
}

export interface Asset {
    id: number;
    name: string;
    description?: string;
    tags: string[];
    thumb: string;
    images?: string[];
    authors: User[];
    properties?: {
        [key in AssetProperties]?: string;
    }
}


export interface WorkshopInfo {
    title: string;
    description: string;
    headerimage: string;
}