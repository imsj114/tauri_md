import { isValidElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PreviewProps {
    content: string;
}

export default function Preview({ content }: PreviewProps) {
    return (
        <div className="flex-1 flex flex-col bg-gray-900">
            <div className="p-2 bg-gray-800 border-b border-gray-700 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Preview
            </div>
            <div className="flex-1 overflow-y-auto p-8 prose prose-invert prose-xl max-w-none 
        prose-headings:font-bold prose-headings:text-gray-100 
        prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
        prose-p:text-gray-300 prose-p:leading-relaxed
        prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
        prose-code:text-pink-400 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-transparent prose-pre:border-0 prose-pre:p-0">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        pre: ({ children }) => {
                            if (!isValidElement(children) || children.type !== 'code') {
                                return <pre className="not-prose m-0 p-0 bg-transparent">{children}</pre>;
                            }

                            const { className, children: codeContent } = children.props as any;
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : 'text';

                            return (
                                <SyntaxHighlighter
                                    PreTag="div"
                                    children={String(codeContent).replace(/\n$/, '')}
                                    language={language}
                                    style={vscDarkPlus}
                                    className="not-prose"
                                    customStyle={{ margin: 0, borderRadius: '0.375rem', background: '#1e1e1e' }}
                                />
                            );
                        }
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div >
    );
}
