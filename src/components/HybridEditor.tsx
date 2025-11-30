import React, { useRef } from 'react';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { Milkdown, useEditor, MilkdownProvider } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { history } from '@milkdown/plugin-history';
import { upload, uploadConfig } from '@milkdown/plugin-upload';
import { useSettings } from '../context/SettingsContext';

interface HybridEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const EditorComponent: React.FC<HybridEditorProps> = ({ value, onChange }) => {
    // Use a ref to track if the update is coming from the editor itself
    // to prevent infinite loops or cursor jumping
    const isUpdatingRef = useRef(false);
    const { fontSize, lineHeight, fontFamily } = useSettings();

    const { loading } = useEditor((root) =>
        Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, root);
                ctx.set(defaultValueCtx, value);

                // Configure upload plugin
                ctx.update(uploadConfig.key, (prev) => ({
                    ...prev,
                    uploader: async (files, schema) => {
                        const images: any[] = []; // Using any to avoid complex ProseMirror type imports for now

                        for (const file of files) {
                            if (file && file.type.includes('image')) {
                                const base64 = await new Promise<string>((resolve) => {
                                    const reader = new FileReader();
                                    reader.readAsDataURL(file);
                                    reader.onload = () => resolve(reader.result as string);
                                });

                                const image = schema.nodes.image.createAndFill({
                                    src: base64,
                                    alt: file.name,
                                });

                                if (image) {
                                    images.push(image);
                                }
                            }
                        }

                        return images;
                    },
                }));

                // Set up listener for content changes
                ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, prevMarkdown) => {
                    if (markdown !== prevMarkdown) {
                        isUpdatingRef.current = true;
                        onChange(markdown);
                        isUpdatingRef.current = false;
                    }
                });
            })
            .use(commonmark)
            .use(history)
            .use(listener)
            .use(upload)
    );

    // Handle external value changes (e.g. loading a new file)
    // We need to be careful not to overwrite the editor state if the change came from the editor itself
    // However, Milkdown's React binding is a bit tricky with controlled inputs.
    // For a true controlled component, we might need a more complex setup or just accept
    // that we re-initialize when the file changes (which is acceptable for file switching).

    // Simple approach: Re-create editor when file changes (key prop in parent)
    // or use an effect to update content if the value changes significantly and not from local edit.

    const fontStyle = {
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight,
        fontFamily: fontFamily === 'mono' ? 'monospace' : fontFamily === 'serif' ? 'serif' : 'sans-serif',
    };

    return (
        <div
            className="flex-1 overflow-auto p-8 prose prose-invert max-w-none focus:outline-none relative min-h-[200px] [&_.ProseMirror]:outline-none"
            style={fontStyle}
        >
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
                    <div className="text-gray-500">Loading editor...</div>
                </div>
            )}
            <Milkdown />
        </div>
    );
};

const HybridEditor: React.FC<HybridEditorProps> = (props) => {
    return (
        <div className="flex-1 flex flex-col bg-gray-900 h-full overflow-hidden">
            <div className="p-2 bg-gray-800 border-b border-gray-700 text-xs text-gray-400 uppercase tracking-wider font-semibold flex justify-between items-center">
                <span>Hybrid Editor</span>
                <span className="text-[10px] bg-blue-900 text-blue-200 px-2 py-0.5 rounded">WYSIWYG</span>
            </div>
            <MilkdownProvider>
                <EditorComponent {...props} />
            </MilkdownProvider>
        </div>
    );
};

export default HybridEditor;