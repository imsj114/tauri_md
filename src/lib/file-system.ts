import { open } from '@tauri-apps/plugin-dialog';
import { readDir, readTextFile, writeTextFile, stat, remove, exists } from '@tauri-apps/plugin-fs';
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
        const fileExists = await exists(configPath);
        if (!fileExists) {
            console.log('Config file does not exist:', configPath);
            return { pinnedFiles: [] };
        }

        console.log('Loading config from:', configPath);
        const content = await readTextFile(configPath);
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
    await writeTextFile(configPath, JSON.stringify(normalizedConfig, null, 2));
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
    const entries = await readDir(path);
    const config = await loadConfig(path);

    // Filter and map to promises with stats
    const filePromises = entries
        .filter((entry) => entry.isDirectory || entry.name.endsWith('.md'))
        .map(async (entry) => {
            const name = entry.name.normalize('NFC');
            const filePath = `${path}/${entry.name}`;
            try {
                const metadata = await stat(filePath);
                return {
                    name: name,
                    path: filePath,
                    isDirectory: entry.isDirectory,
                    updatedAt: metadata.mtime ? new Date(metadata.mtime).getTime() : 0,
                    isPinned: config.pinnedFiles.includes(name),
                };
            } catch (e) {
                console.error(`Failed to stat ${filePath}`, e);
                return {
                    name: name,
                    path: filePath,
                    isDirectory: entry.isDirectory,
                    updatedAt: 0,
                    isPinned: config.pinnedFiles.includes(name),
                };
            }
        });

    const files = await Promise.all(filePromises);

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
    await remove(path);
}

export async function readFile(path: string): Promise<string> {
    if (isMock) return readFileMock(path);
    return await readTextFile(path);
}

export async function saveFile(path: string, content: string): Promise<void> {
    if (isMock) return saveFileMock(path, content);
    await writeTextFile(path, content);
}

export async function createFile(path: string, name: string, content: string = ''): Promise<void> {
    if (isMock) return createFileMock(path, name, content);
    const filePath = `${path}/${name}`;
    await writeTextFile(filePath, content);
}
