import { FileEntry } from './file-system';

const STORAGE_KEY_FILES = 'mock_files';
const STORAGE_KEY_CONTENTS = 'mock_contents';

let mockFiles: FileEntry[] = [];
let mockFileContents: Record<string, string> = {};

function loadMockData() {
    const savedFiles = localStorage.getItem(STORAGE_KEY_FILES);
    const savedContents = localStorage.getItem(STORAGE_KEY_CONTENTS);

    if (savedFiles && savedContents) {
        mockFiles = JSON.parse(savedFiles);
        mockFileContents = JSON.parse(savedContents);
    } else {
        // Initial data
        mockFiles = [
            { name: 'welcome.md', path: '/mock/welcome.md', isDirectory: false, updatedAt: Date.now(), isPinned: false },
            { name: 'notes', path: '/mock/notes', isDirectory: true, updatedAt: Date.now(), isPinned: false },
        ];
        mockFileContents = {
            '/mock/welcome.md': '# Welcome to Mock Mode\n\nThis is a mock file system for testing.',
        };
        saveMockData();
    }
}

function saveMockData() {
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(mockFiles));
    localStorage.setItem(STORAGE_KEY_CONTENTS, JSON.stringify(mockFileContents));
}

// Load data immediately
loadMockData();

export async function openFolderMock(): Promise<string | null> {
    return '/mock';
}

export async function listFilesMock(path: string): Promise<FileEntry[]> {
    console.log('Mock listFiles', path);
    if (path === '/mock') {
        return [...mockFiles].sort((a, b) => {
            if (a.isPinned !== b.isPinned) {
                return a.isPinned ? -1 : 1;
            }
            if (a.isDirectory !== b.isDirectory) {
                return a.isDirectory ? -1 : 1;
            }
            return b.updatedAt - a.updatedAt;
        });
    }
    return [];
}

export async function readFileMock(path: string): Promise<string> {
    if (mockFileContents[path]) {
        return mockFileContents[path];
    }
    throw new Error('File not found');
}

export async function saveFileMock(path: string, content: string): Promise<void> {
    console.log('Mock saveFile', path);
    mockFileContents[path] = content;

    const fileEntry = mockFiles.find(f => f.path === path);
    if (fileEntry) {
        fileEntry.updatedAt = Date.now();
    }
    saveMockData();
}

export async function createFileMock(path: string, name: string, content: string = ''): Promise<void> {
    console.log('Mock createFile', path, name);
    const filePath = `${path}/${name}`;
    mockFiles.push({ name, path: filePath, isDirectory: false, updatedAt: Date.now(), isPinned: false });
    mockFileContents[filePath] = content;
    saveMockData();
}

export async function deleteFileMock(path: string): Promise<void> {
    console.log('Mock deleteFile', path);
    const index = mockFiles.findIndex(f => f.path === path);
    if (index !== -1) {
        mockFiles.splice(index, 1);
    }
    delete mockFileContents[path];
    saveMockData();
}
