import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HybridEditor from './components/HybridEditor';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { openFolder, listFiles, readFile, saveFile, createFile, FileEntry, sortFiles, saveConfig, deleteFile, renameFile } from './lib/file-system';
import InputModal from './components/InputModal';
import SettingsModal from './components/SettingsModal';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Save } from 'lucide-react';
import { ask } from '@tauri-apps/plugin-dialog';

function AppContent() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [currentFile, setCurrentFile] = useState<FileEntry | null>(null);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState('# Welcome\n\nOpen a folder to start editing.');
  const [isDirty, setIsDirty] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Rename state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<FileEntry | null>(null);

  const { viewMode } = useSettings();

  const handleOpenFolder = async () => {
    try {
      const path = await openFolder();
      if (path) {
        setCurrentPath(path);
        const entries = await listFiles(path);
        setFiles(entries);
        setCurrentFile(null);
        setMarkdown('# Folder Opened\n\nSelect a file to edit.');
      }
    } catch (error) {
      console.error('Error opening folder:', error);
    }
  };

  const handleFileSelect = async (file: FileEntry) => {
    if (file.isDirectory) return; // Handle directory navigation later

    try {
      const content = await readFile(file.path);
      setCurrentFile(file);
      setMarkdown(content);
      setIsDirty(false);
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };

  const handleSave = async () => {
    if (!currentFile) return;
    try {
      await saveFile(currentFile.path, markdown);
      setIsDirty(false);

      // Optimistic update: Update timestamp and re-sort locally
      // This avoids race conditions with the file system
      setFiles(prevFiles => {
        const updatedFiles = prevFiles.map(f => {
          if (f.path === currentFile.path) {
            return { ...f, updatedAt: Date.now() };
          }
          return f;
        });
        return sortFiles(updatedFiles);
      });
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const handleTogglePin = async (file: FileEntry) => {
    if (!currentPath) return;

    const newIsPinned = !file.isPinned;

    // Optimistic update
    const updatedFiles = files.map(f =>
      f.path === file.path ? { ...f, isPinned: newIsPinned } : f
    );
    setFiles(sortFiles(updatedFiles));

    // Persist config
    const pinnedFiles = updatedFiles
      .filter(f => f.isPinned)
      .map(f => f.name);

    try {
      await saveConfig(currentPath, { pinnedFiles });
    } catch (error) {
      console.error('Failed to save config:', error);
      // Revert on error (optional, but good practice)
    }
  };

  const handleDeleteFile = async (file: FileEntry) => {
    if (!currentPath) return;

    const yes = await ask(`Are you sure you want to delete "${file.name}"?`, {
      title: 'Confirm Deletion',
      kind: 'warning',
    });

    if (!yes) return;

    try {
      await deleteFile(file.path);

      // Optimistic update
      const updatedFiles = files.filter(f => f.path !== file.path);
      setFiles(updatedFiles);

      if (currentFile?.path === file.path) {
        setCurrentFile(null);
        setMarkdown('# Select a file');
      }

      // Update config if pinned
      if (file.isPinned) {
        const pinnedFiles = updatedFiles
          .filter(f => f.isPinned)
          .map(f => f.name);
        await saveConfig(currentPath, { pinnedFiles });
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file');
    }
  };

  const handleNewFile = () => {
    if (!currentPath) return;
    setIsModalOpen(true);
  };

  const handleCreateFile = async (fileName: string) => {
    if (!currentPath) return;

    const finalName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;

    try {
      await createFile(currentPath, finalName, '# New File\n');
      const entries = await listFiles(currentPath);
      setFiles(entries);

      // Select the new file
      const newFile = entries.find(e => e.name === finalName);
      if (newFile) {
        handleFileSelect(newFile);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating file:', error);
      alert(`Failed to create file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleRenameRequest = (file: FileEntry) => {
    setFileToRename(file);
    setIsRenameModalOpen(true);
  };

  const handleRenameFile = async (newName: string) => {
    if (!currentPath || !fileToRename) return;

    // Keep extension if user didn't provide one, or enforce .md if it was .md
    let finalName = newName;
    if (fileToRename.name.endsWith('.md') && !finalName.endsWith('.md')) {
      finalName += '.md';
    }

    const newPath = `${currentPath}/${finalName}`;

    try {
      await renameFile(fileToRename.path, newPath);

      // Refresh file list
      const entries = await listFiles(currentPath);
      setFiles(entries);

      // If we renamed the current file, update currentFile state
      if (currentFile?.path === fileToRename.path) {
        const newFileEntry = entries.find(e => e.name === finalName);
        if (newFileEntry) {
          setCurrentFile(newFileEntry);
        }
      }

      // Update pinned config if needed
      if (fileToRename.isPinned) {
        // Actually, listFiles reads config. We need to update config with new name.
        // Wait, listFiles reads config based on names. If we rename, the name in config is old.
        // We need to update config.

        // Let's get the current pinned list from state (before refresh, or re-calculate)
        // Easier: Read config, replace old name with new name, save.
        // But we already refreshed files.

        // Let's just update the config directly.
        const currentPinned = files.filter(f => f.isPinned).map(f => f.name);
        const newPinned = currentPinned.map(name => name === fileToRename.name ? finalName : name);
        await saveConfig(currentPath, { pinnedFiles: newPinned });

        // Refresh again to get correct pinned status
        const refreshedEntries = await listFiles(currentPath);
        setFiles(refreshedEntries);
      }

      setIsRenameModalOpen(false);
      setFileToRename(null);

    } catch (error) {
      console.error('Error renaming file:', error);
      alert(`Failed to rename file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleContentChange = (value: string) => {
    setMarkdown(value);
    if (currentFile && !isDirty) {
      setIsDirty(true);
    }
  };

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFile, markdown]);

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white overflow-hidden font-sans">
      <Sidebar
        files={files}
        onFileSelect={handleFileSelect}
        onOpenFolder={handleOpenFolder}
        onNewFile={handleNewFile}
        onTogglePin={handleTogglePin}
        onDeleteFile={handleDeleteFile}
        onRenameFile={handleRenameRequest}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentFile={currentFile}
        isReady={!!currentPath}
      />
      <div className="flex flex-1 flex-col">
        {/* Toolbar */}
        {currentFile && (
          <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between">
            <span className="text-sm text-gray-400 truncate max-w-xl">{currentFile.path}</span>
            <button
              onClick={handleSave}
              className={`p-1 rounded transition-colors ${isDirty ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-white'
                }`}
              title="Save (Cmd+S)"
            >
              <Save size={18} />
            </button>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden relative flex">
          {viewMode === 'hybrid' ? (
            /* Key prop ensures editor is re-mounted when file changes, 
                which is the simplest way to handle content reset in Milkdown 
                without complex effect logic */
            <HybridEditor
              key={currentFile ? currentFile.path : 'empty'}
              value={markdown}
              onChange={handleContentChange}
            />
          ) : (
            <>
              <Editor value={markdown} onChange={handleContentChange} />
              <Preview content={markdown} />
            </>
          )}
        </div>
      </div>

      <InputModal
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleCreateFile}
        title="Create New File"
        message="Enter the name for your new Markdown file:"
        placeholder="filename.md"
      />

      <InputModal
        isOpen={isRenameModalOpen}
        onCancel={() => {
          setIsRenameModalOpen(false);
          setFileToRename(null);
        }}
        onConfirm={handleRenameFile}
        title="Rename File"
        message={`Enter new name for "${fileToRename?.name}":`}
        placeholder={fileToRename?.name || ""}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
