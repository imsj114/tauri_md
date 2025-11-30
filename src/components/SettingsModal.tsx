import React from 'react';
import { X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { fontSize, lineHeight, theme, fontFamily, viewMode, updateSettings } = useSettings();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-lg shadow-xl w-96 border border-gray-700 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Font Size */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium text-gray-300">Font Size</label>
                            <span className="text-sm text-gray-400">{fontSize}px</span>
                        </div>
                        <input
                            type="range"
                            min="12"
                            max="32"
                            step="1"
                            value={fontSize}
                            onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    {/* Line Height */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium text-gray-300">Line Height</label>
                            <span className="text-sm text-gray-400">{lineHeight}</span>
                        </div>
                        <input
                            type="range"
                            min="1.0"
                            max="2.5"
                            step="0.1"
                            value={lineHeight}
                            onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    {/* Font Family */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 block">Font Family</label>
                        <select
                            value={fontFamily}
                            onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded p-2 focus:outline-none focus:border-blue-500"
                        >
                            <option value="sans">Sans Serif</option>
                            <option value="serif">Serif</option>
                            <option value="mono">Monospace</option>
                        </select>
                    </div>

                    {/* View Mode */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 block">View Mode</label>
                        <div className="flex bg-gray-700 rounded p-1">
                            <button
                                className={`flex-1 py-1 rounded text-sm transition-colors ${viewMode === 'hybrid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                onClick={() => updateSettings({ viewMode: 'hybrid' })}
                            >
                                Hybrid (WYSIWYG)
                            </button>
                            <button
                                className={`flex-1 py-1 rounded text-sm transition-colors ${viewMode === 'split' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                onClick={() => updateSettings({ viewMode: 'split' })}
                            >
                                Split (Editor + Preview)
                            </button>
                        </div>
                    </div>

                    {/* Theme (Placeholder for now as app is dark-only) */}
                    <div className="space-y-2 opacity-50 pointer-events-none" title="Coming soon">
                        <label className="text-sm font-medium text-gray-300 block">Theme</label>
                        <div className="flex bg-gray-700 rounded p-1">
                            <button
                                className={`flex-1 py-1 rounded text-sm ${theme === 'dark' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}
                                onClick={() => updateSettings({ theme: 'dark' })}
                            >
                                Dark
                            </button>
                            <button
                                className={`flex-1 py-1 rounded text-sm ${theme === 'light' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}
                                onClick={() => updateSettings({ theme: 'light' })}
                            >
                                Light
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-900/50 border-t border-gray-700 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
