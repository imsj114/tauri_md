import { useState } from 'react';
import { FileText, Folder, FolderOpen, Plus, Pin, Settings } from 'lucide-react';
import { FileEntry } from '../lib/file-system';
import { motion, AnimatePresence } from 'framer-motion';
import ContextMenu from './ContextMenu';

interface SidebarProps {
    files: FileEntry[];
    onFileSelect: (file: FileEntry) => void;
    onOpenFolder: () => void;
    onNewFile: () => void;
    onTogglePin: (file: FileEntry) => void;
    onDeleteFile: (file: FileEntry) => void;
    onOpenSettings: () => void;
    currentFile: FileEntry | null;
    isReady: boolean;
}

export default function Sidebar({ files, onFileSelect, onOpenFolder, onNewFile, onTogglePin, onDeleteFile, onOpenSettings, currentFile, isReady }: SidebarProps) {
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileEntry } | null>(null);

    const handleContextMenu = (e: React.MouseEvent, file: FileEntry) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, file });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    return (
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col relative">
            {/* ... (header) */}
            <div className="p-4 border-b border-gray-700 font-bold text-gray-100 flex justify-between items-center">
                <span>Files</span>
                <div className="flex gap-1">
                    <button
                        onClick={onOpenSettings}
                        className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
                        title="Settings"
                    >
                        <Settings size={18} />
                    </button>
                    <button
                        onClick={onNewFile}
                        disabled={!isReady}
                        className={`p-1 rounded transition-colors ${isReady
                            ? 'hover:bg-gray-600 text-gray-400 hover:text-white'
                            : 'text-gray-600 cursor-not-allowed'
                            }`}
                        title={isReady ? "New File" : "Open a folder first"}
                    >
                        <Plus size={18} />
                    </button>
                    <button
                        onClick={onOpenFolder}
                        className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
                        title="Open Folder"
                    >
                        <FolderOpen size={18} />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {files.length === 0 ? (
                    <div className="text-gray-500 text-sm text-center mt-4">
                        No files found. Open a folder to start.
                    </div>
                ) : (
                    <AnimatePresence>
                        {files.map((file) => (
                            <motion.div
                                key={file.path}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => onFileSelect(file)}
                                onContextMenu={(e) => handleContextMenu(e, file)}
                                className={`flex items-center p-2 rounded cursor-pointer mb-1 group relative ${currentFile?.path === file.path
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                                title="Right-click for options"
                            >
                                {file.isDirectory ? (
                                    <Folder size={16} className="mr-2 text-yellow-500" />
                                ) : (
                                    <FileText size={16} className="mr-2 text-blue-400" />
                                )}
                                <span className="truncate text-sm flex-1">{file.name}</span>
                                {file.isPinned && (
                                    <Pin size={14} className="text-yellow-400 ml-2 rotate-45" />
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={handleCloseContextMenu}
                    onPin={() => onTogglePin(contextMenu.file)}
                    onDelete={() => onDeleteFile(contextMenu.file)}
                    isPinned={!!contextMenu.file.isPinned}
                />
            )}
        </div>
    );
}
