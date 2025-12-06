export interface FileEntry {
    path: string;
    name: string;
    folder: string;
}

export interface FileResponse {
    files: FileEntry[];
}

export interface FileContentResponse {
    content: string;
}
