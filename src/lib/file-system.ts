import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { openFolderMock, listFilesMock, readFileMock, saveFileMock, createFileMock, deleteFileMock } from './mock-file-system';

const isMock = new URLSearchParams(window.location.search).get('mock') === 'true';

export interface FileEntry {
    name: string;
    path: string;
    isDirectory: boolean;
    updatedAt: number;
    isPinned?: boolean;
}

interface FolderConfig {
    pinnedFiles: string[];
}

const CONFIG_FILE = '.tauri-md.json';

// In-memory cache to prevent data loss if read fails momentarily
let configCache: Record<string, FolderConfig> = {};

async function loadConfig(folderPath: string): Promise<FolderConfig> {
    if (isMock) return { pinnedFiles: [] };
    const configPath = `${folderPath}/${CONFIG_FILE}`;

    try {
        // Use Rust command to check existence
        const fileExists = await invoke<boolean>('check_file_exists', { path: configPath });
        if (!fileExists) {
            console.log('Config file does not exist:', configPath);
            return { pinnedFiles: [] };
        }

        console.log('Loading config from:', configPath);
        // Use Rust command to read file
        const content = await invoke<string>('read_file', { path: configPath });
        const config = JSON.parse(content);

        const parsedConfig = {
            pinnedFiles: (config.pinnedFiles || []).map((name: string) => name.normalize('NFC'))
        };

        // Update cache
        configCache[folderPath] = parsedConfig;
        console.log('Loaded and cached config:', parsedConfig);
        return parsedConfig;
    } catch (e) {
        console.error('CRITICAL: Failed to load config:', e);

        // Fallback to cache if available
        if (configCache[folderPath]) {
            console.warn('Returning cached config due to read error');
            return configCache[folderPath];
        }
    }
    return { pinnedFiles: [] };
}

export async function saveConfig(folderPath: string, config: FolderConfig): Promise<void> {
    if (isMock) return;
    const configPath = `${folderPath}/${CONFIG_FILE}`;
    const normalizedConfig = {
        pinnedFiles: config.pinnedFiles.map(name => name.normalize('NFC'))
    };

    // Update cache immediately
    configCache[folderPath] = normalizedConfig;

    console.log('Saving config to:', configPath, normalizedConfig);
    // Use Rust command to save file
    await invoke('save_file', { path: configPath, content: JSON.stringify(normalizedConfig, null, 2) });
}

export async function openFolder(): Promise<string | null> {
    if (isMock) return openFolderMock();
    const selected = await open({
        directory: true,
        multiple: false,
    });
    return selected as string | null;
}

export async function listFiles(path: string): Promise<FileEntry[]> {
    if (isMock) return listFilesMock(path);

    // Use Rust command to list files
    // Rust returns { name, path, isDirectory, updatedAt } (camelCase)
    const entries = await invoke<FileEntry[]>('list_files', { path });
    const config = await loadConfig(path);

    // Map entries to include isPinned
    const files = entries.map(entry => {
        const name = entry.name.normalize('NFC');
        return {
            ...entry,
            name: name, // Ensure normalized name
            isPinned: config.pinnedFiles.includes(name),
        };
    });

    return sortFiles(files);
}

export function sortFiles(files: FileEntry[]): FileEntry[] {
    return files.sort((a, b) => {
        // Pinned files first
        if (a.isPinned !== b.isPinned) {
            return a.isPinned ? -1 : 1;
        }
        // Directories first, then by date descending
        if (a.isDirectory !== b.isDirectory) {
            return a.isDirectory ? -1 : 1;
        }
        return b.updatedAt - a.updatedAt;
    });
}

export async function deleteFile(path: string): Promise<void> {
    if (isMock) return deleteFileMock(path);
    // Use Rust command to delete file
    await invoke('delete_file', { path });
}

export async function readFile(path: string): Promise<string> {
    if (isMock) return readFileMock(path);
    // Use Rust command to read file
    return await invoke<string>('read_file', { path });
}

export async function saveFile(path: string, content: string): Promise<void> {
    if (isMock) return saveFileMock(path, content);
    // Use Rust command to save file
    await invoke('save_file', { path, content });
}

export async function createFile(path: string, name: string, content: string = ''): Promise<void> {
    if (isMock) return createFileMock(path, name, content);
    // Use Rust command to create file
    await invoke('create_file', { path, name, content });
}

export async function renameFile(oldPath: string, newPath: string): Promise<void> {
    if (isMock) {
        // Mock implementation for rename
        console.log('Mock rename:', oldPath, '->', newPath);
        return;
    }
    await invoke('rename_file', { oldPath, newPath });
}
