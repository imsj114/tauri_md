import { useEffect, useRef } from 'react';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onPin: () => void;
    onDelete: () => void;
    onRename: () => void;
    isPinned: boolean;
}

export default function ContextMenu({ x, y, onClose, onPin, onDelete, onRename, isPinned }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-gray-800 border border-gray-700 rounded shadow-xl py-1 w-40 text-sm"
            style={{ top: y, left: x }}
        >
            <button
                onClick={() => {
                    onPin();
                    onClose();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-200"
            >
                {isPinned ? 'Unpin' : 'Pin'}
            </button>
            <button
                onClick={() => {
                    onRename();
                    onClose();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-200"
            >
                Rename
            </button>
            <div className="h-px bg-gray-700 my-1" />
            <button
                onClick={() => {
                    onDelete();
                    onClose();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400 hover:text-red-300"
            >
                Delete
            </button>
        </div>
    );
}
