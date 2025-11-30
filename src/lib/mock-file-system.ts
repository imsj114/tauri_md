import { FileEntry } from './file-system';

const MOCK_DELAY = 300;
const STORAGE_KEY = 'tauri-md-mock-fs';

interface MockFileSystem {
    [path: string]: string; // content
}

const DEFAULT_FILES: MockFileSystem = {
    '/mock/welcome.md': '# Welcome to Tauri MD (Mock)\n\nThis is a mock file system running in the browser.\n\n- [x] Test persistence\n- [ ] Try editing this file',
    '/mock/notes.md': '# Notes\n\n* Buy milk\n* Walk the dog',
    '/mock/project/readme.md': '# Project\n\nThis is a nested file.',
};

function getMockData(): MockFileSystem {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FILES));
    return DEFAULT_FILES;
}

function saveMockData(data: MockFileSystem) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const delay = () => new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

export async function openFolderMock(): Promise<string> {
    await delay();
    return '/mock';
}

export async function listFilesMock(path: string): Promise<FileEntry[]> {
    await delay();
    const data = getMockData();
    const entries: FileEntry[] = [];
    const seenDirs = new Set<string>();

    Object.keys(data).forEach(filePath => {
        if (!filePath.startsWith(path)) return;

        const relativePath = filePath.slice(path.length + 1);
        const parts = relativePath.split('/');

        if (parts.length === 1) {
            // File
            entries.push({
                name: parts[0],
                path: filePath,
                isDirectory: false,
                updatedAt: Date.now(),
            });
        } else {
            // Directory
            const dirName = parts[0];
            if (!seenDirs.has(dirName)) {
                seenDirs.add(dirName);
                entries.push({
                    name: dirName,
                    path: `${path}/${dirName}`,
                    isDirectory: true,
                    updatedAt: Date.now(),
                });
            }
        }
    });

    return entries;
}

export async function readFileMock(path: string): Promise<string> {
    await delay();
    const data = getMockData();
    if (data[path] === undefined) throw new Error('File not found');
    return data[path];
}

export async function saveFileMock(path: string, content: string): Promise<void> {
    await delay();
    const data = getMockData();
    data[path] = content;
    saveMockData(data);
}

export async function createFileMock(path: string, name: string, content: string = ''): Promise<void> {
    await delay();
    const data = getMockData();
    const filePath = `${path}/${name}`;
    if (data[filePath]) throw new Error('File already exists');
    data[filePath] = content;
    saveMockData(data);
}

export async function deleteFileMock(path: string): Promise<void> {
    await delay();
    const data = getMockData();
    if (data[path]) {
        delete data[path];
        saveMockData(data);
    }
}
