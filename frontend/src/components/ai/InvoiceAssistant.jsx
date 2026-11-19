
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  X,
  Send,
  Sparkles,
  MessageCircle,
  Minimize2,
  Plus,
  History,
  Trash2,
  ArrowLeft,
  LoaderCircle,
} from "lucide-react";

import {
  sendAIMessage,
  getAIConversations,
  createAIConversation,
  getAIConversationMessages,
  deleteAIConversation,
} from "../../services/ai.service";

const suggestedQuestions = [
  "How much money is outstanding?",
  "Which clients have overdue invoices?",
  "Give me a billing summary.",
];

const welcomeMessage = {
  role: "assistant",
  content:
    "Hi! I'm InvoiceFlow AI. I can help you understand your invoices, clients, payments, and outstanding balances. What would you like to know?",
};

const InvoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] =
    useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] =
    useState(false);
  const [isLoadingMessages, setIsLoadingMessages] =
    useState(false);
  const [deletingConversationId, setDeletingConversationId] =
    useState(null);

  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const activeConversationRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    activeConversationRef.current = activeConversationId;
  }, [activeConversationId]);

  // Scroll to the newest message.
  useEffect(() => {
    if (isOpen && !showHistory) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, isLoading, isOpen, showHistory]);

  // Focus the input when the chat opens.
  useEffect(() => {
    if (isOpen && !showHistory) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);

      return () => clearTimeout(timeout);
    }
  }, [isOpen, showHistory]);

  // Load saved conversations when the assistant opens.
  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);

    try {
      const savedConversations = await getAIConversations();

      setConversations(savedConversations);

      return savedConversations;
    } catch (err) {
      setError(
        err.message || "Unable to load saved conversations."
      );

      return null;
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Load the messages belonging to a selected conversation.
  const openConversation = useCallback(async (conversationId) => {
    if (!conversationId || isLoading) return;

    const requestId = ++requestIdRef.current;

    activeConversationRef.current = conversationId;
    setActiveConversationId(conversationId);
    setMessages([]);
    setError("");
    setShowHistory(false);
    setIsLoadingMessages(true);

    try {
      const savedMessages =
        await getAIConversationMessages(conversationId);

      // Ignore stale responses if another conversation was selected.
      if (
        requestIdRef.current !== requestId ||
        activeConversationRef.current !== conversationId
      ) {
        return;
      }

      setMessages(
        savedMessages.map((item) => ({
          id: item._id,
          role: item.role,
          content: item.content,
        }))
      );
    } catch (err) {
      if (requestIdRef.current === requestId) {
        setError(
          err.message || "Unable to load this conversation."
        );
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoadingMessages(false);
      }
    }
  }, [isLoading]);

  // Load the saved conversation list when the assistant opens.
  // Don't auto-open an old conversation; a fresh chat is the default.
  useEffect(() => {
    if (!isOpen) return;
    loadConversations();
  }, [isOpen, loadConversations]);

  // Start a blank conversation. It is created in MongoDB
  // when the user sends their first message.
  const handleNewConversation = () => {
    if (isLoading || isLoadingMessages) return;

    requestIdRef.current += 1;
    activeConversationRef.current = null;

    setActiveConversationId(null);
    setMessages([]);
    setInput("");
    setError("");
    setShowHistory(false);

    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = async (question = input) => {
    const message = question.trim();

    if (
      !message ||
      isLoading ||
      isLoadingMessages
    ) {
      return;
    }

    if (message.length > 1000) {
      setError("Your message cannot exceed 1000 characters.");
      return;
    }

    setInput("");
    setError("");
    setIsLoading(true);

    setMessages((previous) => [
      ...previous,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
      },
    ]);

    try {
      let conversationId = activeConversationRef.current;

      // Create the database conversation on the first message.
      if (!conversationId) {
        const conversation = await createAIConversation();

        conversationId = conversation._id;

        activeConversationRef.current = conversationId;
        setActiveConversationId(conversationId);

        setConversations((previous) => [
          conversation,
          ...previous.filter(
            (item) => item._id !== conversationId
          ),
        ]);
      }

      const result = await sendAIMessage({
        message,
        conversationId,
      });

      setMessages((previous) => [
        ...previous,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.reply,
        },
      ]);

      // Refresh titles and ordering after a successful response.
      const updatedConversations = await getAIConversations();
      setConversations(updatedConversations);
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (
      isLoading ||
      isLoadingMessages ||
      deletingConversationId
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this conversation and all its messages? This cannot be undone."
    );

    if (!confirmed) return;

    setDeletingConversationId(conversationId);
    setError("");

    try {
      await deleteAIConversation(conversationId);

      const remaining = conversations.filter(
        (item) => item._id !== conversationId
      );

      setConversations(remaining);

      if (activeConversationRef.current === conversationId) {
        requestIdRef.current += 1;
        activeConversationRef.current = null;

        setActiveConversationId(null);
        setMessages([]);
      }

      if (remaining.length === 0) {
        setShowHistory(false);
      }
    } catch (err) {
      setError(
        err.message || "Unable to delete this conversation."
      );
    } finally {
      setDeletingConversationId(null);
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent?.isComposing
    ) {
      event.preventDefault();
      handleSend();
    }
  };

  const visibleMessages = messages.length
    ? messages
    : [welcomeMessage];

  const formatConversationDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label={
          isOpen ? "Close InvoiceFlow AI" : "Open InvoiceFlow AI"
        }
        aria-expanded={isOpen}
        className="fixed bottom-5 right-5 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-[#2F1B5E] text-white shadow-xl shadow-violet-950/25 transition-colors hover:bg-[#40267D] focus:outline-none focus:ring-4 focus:ring-violet-300"
      >
        {isOpen ? <X size={23} /> : <MessageCircle size={25} />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            key="invoice-assistant"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="InvoiceFlow AI assistant"
            className="fixed bottom-24 right-4 z-[100] flex h-[min(620px,calc(100dvh-120px))] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-2xl shadow-slate-900/20"
          >
            {/* Header */}
            <header className="flex items-center justify-between bg-[#2F1B5E] px-3 py-3.5 text-white">
              <div className="flex min-w-0 items-center gap-2.5">
                {showHistory ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowHistory(false);
                      setError("");
                    }}
                    aria-label="Back to chat"
                    className="rounded-lg p-2 hover:bg-white/10"
                  >
                    <ArrowLeft size={19} />
                  </button>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Bot size={24} />
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="font-semibold">
                    {showHistory ? "Chat history" : "InvoiceFlow AI"}
                  </h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-violet-200">
                    <Sparkles size={12} />
                    {showHistory
                      ? `${conversations.length} saved conversation${conversations.length === 1 ? "" : "s"}`
                      : "Your invoice assistant"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleNewConversation}
                  disabled={isLoading || isLoadingMessages}
                  aria-label="Start a new conversation"
                  title="New conversation"
                  className="rounded-lg p-2 transition hover:bg-white/10 disabled:opacity-40"
                >
                  <Plus size={19} />
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setShowHistory(true);
                    setError("");
                    await loadConversations();
                  }}
                  disabled={isLoading || isLoadingMessages}
                  aria-label="View chat history"
                  title="Chat history"
                  className="rounded-lg p-2 transition hover:bg-white/10 disabled:opacity-40"
                >
                  <History size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Minimize chat"
                  className="rounded-lg p-2 transition hover:bg-white/10"
                >
                  <Minimize2 size={17} />
                </button>
              </div>
            </header>

            {showHistory ? (
              /* Conversation history */
              <div className="flex-1 overflow-y-auto bg-slate-50 p-3">
                <button
                  type="button"
                  onClick={handleNewConversation}
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2F1B5E] px-3 py-3 text-sm font-medium text-white transition hover:bg-[#40267D]"
                >
                  <Plus size={17} />
                  New conversation
                </button>

                {isLoadingConversations ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                    <LoaderCircle size={17} className="animate-spin" />
                    Loading conversations...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <MessageCircle
                      size={30}
                      className="mx-auto text-violet-300"
                    />
                    <p className="mt-3 text-sm font-medium text-slate-700">
                      No saved conversations yet
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Your chats will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation._id}
                        className={`flex items-center gap-2 rounded-xl border p-3 ${conversation._id === activeConversationId
                          ? "border-violet-300 bg-violet-50"
                          : "border-slate-200 bg-white"
                          }`}
                      >
                        <button
                          type="button"
                          disabled={
                            isLoading ||
                            isLoadingMessages ||
                            Boolean(deletingConversationId)
                          }
                          onClick={() =>
                            openConversation(conversation._id)
                          }
                          className="min-w-0 flex-1 text-left disabled:opacity-50"
                        >
                          <p className="truncate text-sm font-medium text-slate-800">
                            {conversation.title || "New conversation"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {formatConversationDate(
                              conversation.lastMessageAt ||
                              conversation.updatedAt
                            )}
                          </p>
                        </button>

                        <button
                          type="button"
                          disabled={
                            isLoading ||
                            isLoadingMessages ||
                            Boolean(deletingConversationId)
                          }
                          onClick={() =>
                            handleDeleteConversation(conversation._id)
                          }
                          aria-label={`Delete ${conversation.title || "conversation"}`}
                          title="Delete conversation"
                          className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                        >
                          {deletingConversationId === conversation._id ? (
                            <LoaderCircle
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <p
                    role="alert"
                    className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                  >
                    {error}
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Messages */}
                <div
                  className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4"
                  aria-live="polite"
                  aria-relevant="additions text"
                >
                  {isLoadingMessages ? (
                    <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                      Loading conversation...
                    </div>
                  ) : (
                    <>
                      {messages.length === 0 && (
                        <div className="mb-5 pt-2">
                          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-[#2F1B5E]">
                            <Sparkles size={21} />
                          </div>

                          <h3 className="text-lg font-semibold text-slate-900">
                            How can I help you today?
                          </h3>

                          <p className="mt-1 text-sm leading-5 text-slate-500">
                            Ask me about your invoices, clients,
                            payments, and outstanding balances.
                          </p>

                          <div className="mt-4 space-y-2">
                            {suggestedQuestions.map((question) => (
                              <button
                                key={question}
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleSend(question)}
                                className="block w-full rounded-xl border border-violet-100 bg-white px-3 py-2.5 text-left text-sm text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 disabled:opacity-50"
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {visibleMessages.map((item, index) => (
                        <div
                          key={item.id || `${item.role}-${index}`}
                          className={`flex ${item.role === "user"
                            ? "justify-end"
                            : "justify-start"
                            }`}
                        >
                          {item.role === "assistant" && (
                            <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-[#2F1B5E]">
                              <Bot size={16} />
                            </div>
                          )}

                          <div
                            className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-3 text-sm leading-6 ${item.role === "user"
                              ? "rounded-br-md bg-[#2F1B5E] text-white"
                              : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                              }`}
                          >
                            {item.content}
                          </div>
                        </div>
                      ))}

                      {isLoading && (
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-[#2F1B5E]">
                            <Bot size={16} />
                          </div>

                          <div
                            className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3"
                            role="status"
                            aria-label="InvoiceFlow AI is thinking"
                          >
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.3s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.15s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500" />
                          </div>
                        </div>
                      )}

                      {error && (
                        <div
                          role="alert"
                          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                        >
                          <p>{error}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setError("");
                              inputRef.current?.focus();
                            }}
                            className="mt-1 font-medium underline underline-offset-2"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Composer */}
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSend();
                  }}
                  className="border-t border-slate-200 bg-white p-3"
                >
                  <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask InvoiceFlow AI..."
                      aria-label="Message InvoiceFlow AI"
                      rows={1}
                      maxLength={1000}
                      disabled={isLoading || isLoadingMessages}
                      className="max-h-24 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60"
                    />

                    <button
                      type="submit"
                      disabled={
                        !input.trim() ||
                        isLoading ||
                        isLoadingMessages
                      }
                      aria-label="Send message"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2F1B5E] text-white transition hover:bg-[#40267D] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Send size={17} />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-slate-400">
                    <span>AI can make mistakes. Verify important totals.</span>
                    <span>{input.length}/1000</span>
                  </div>
                </form>
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
};

export default InvoiceAssistant;
