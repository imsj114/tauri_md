interface EditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
    return (
        <div className="flex-1 flex flex-col border-r border-gray-700 bg-gray-900">
            <div className="p-2 bg-gray-800 border-b border-gray-700 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Editor
            </div>
            <textarea
                className="flex-1 bg-transparent p-4 resize-none focus:outline-none font-mono text-sm text-gray-200 leading-relaxed"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                spellCheck={false}
                placeholder="Start typing..."
            />
        </div>
    );
}
