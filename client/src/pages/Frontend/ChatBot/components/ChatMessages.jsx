import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownComponents = {
    p: ({ node, ...props }) => <p className="mb-2 mixed-text" dir="auto" style={{ fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans', sans-serif" }} {...props} />,
    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2 mixed-text" dir="auto" style={{ fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans', sans-serif" }} {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2 mixed-text" dir="auto" style={{ fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans', sans-serif" }} {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-base font-bold mt-2 mb-1 mixed-text" dir="auto" style={{ fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans', sans-serif" }} {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 mixed-text" dir="auto" style={{ fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans', sans-serif" }} {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 mixed-text" dir="auto" style={{ fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans', sans-serif" }} {...props} />,
    li: ({ node, ...props }) => <li className="mb-1 mixed-text" dir="auto" style={{ fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans', sans-serif" }} {...props} />,
    strong: ({ node, ...props }) => <strong className="font-semibold mixed-text" style={{ fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans', sans-serif" }} {...props} />,
    em: ({ node, ...props }) => <em className="italic mixed-text" style={{ fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans', sans-serif" }} {...props} />,
    blockquote: ({ node, ...props }) => (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2 mixed-text" dir="auto" style={{ fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans', sans-serif" }} {...props} />
    ),
    code: ({ node, inline, ...props }) =>
        inline ? (
            <code className="bg-gray-100 px-1 rounded font-mono text-sm mixed-text" dir="ltr" {...props} />
        ) : (
            <pre className="bg-gray-100 p-3 rounded my-2 overflow-x-auto" dir="ltr">
                <code className="font-mono text-sm" {...props} />
            </pre>
        ),
};

const ChatMessages = ({ conversation, chatLoading, chatContainerRef, t }) => {
    return (
        <div
            ref={chatContainerRef}
            className="flex-1 p-4 bg-gray-50 overflow-y-auto"
            style={{
                fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans', sans-serif",
                minHeight: '300px',
                maxHeight: 'calc(100vh - 350px)'
            }}
        >
            {conversation.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <p className="text-gray-500 mixed-text" dir="auto">
                            {t.analyzeFirst}
                        </p>
                    </div>
                </div>
            ) : (
                conversation.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`mb-3 p-3 rounded-lg ${
                            msg.role === "user"
                                ? "bg-green-50 border-l-4 border-green-500"
                                : "bg-gray-50 border-l-4 border-gray-500"
                        } mixed-text`}
                        dir="auto"
                        style={{
                            fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans', sans-serif",
                            lineHeight: '2'
                        }}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <div className="font-semibold text-sm">
                                {msg.role === "user" ? t.you : t.assistant}
                            </div>
                            <div className="text-xs text-gray-500">
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>

                        {msg.isMarkdown ? (
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={MarkdownComponents}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="whitespace-pre-wrap">
                                {msg.content}
                            </div>
                        )}
                    </div>
                ))
            )}
            {chatLoading && (
                <div className="flex items-center p-3 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    {t.thinking}
                </div>
            )}
        </div>
    );
};

export default ChatMessages;