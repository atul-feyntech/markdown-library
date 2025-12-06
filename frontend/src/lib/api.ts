import { FileEntry, FileResponse } from './types';

const API_BASE = 'http://localhost:8080/api';

export async function fetchFiles(folders?: string[]): Promise<FileEntry[]> {
    let url = `${API_BASE}/files`;
    if (folders && folders.length > 0) {
        url += `?folders=${encodeURIComponent(folders.join(','))}`;
    }
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch files');
    const data: FileResponse = await res.json();
    return data.files;
}

export async function fetchFileContent(path: string): Promise<string> {
    const res = await fetch(`${API_BASE}/file?path=${encodeURIComponent(path)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch file content');
    const data = await res.json();
    // primitive handle if backend returns {content: "..."}
    return data.content;
}
