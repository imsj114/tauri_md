import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface InputModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    placeholder?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
}

export default function InputModal({ isOpen, title, message, placeholder, onConfirm, onCancel }: InputModalProps) {
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setValue('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onConfirm(value.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-96 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <p className="text-gray-300 mb-4 text-sm">{message}</p>
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none mb-4"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                            disabled={!value.trim()}
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
