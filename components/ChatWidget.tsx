"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Photo from "./Photo";
import { useShop } from "./ShopProvider";
import { WELCOME, botReply, type BotReply } from "@/lib/chat-bot";
import { formatPrice } from "@/lib/products";

type Msg = ({ from: "bot" } & BotReply) | { from: "you"; text: string };

const MAX_INPUT = 300;

/** Floating help chat shown on every shop page. Answers come from lib/chat-bot.ts, in the browser. */
export default function ChatWidget() {
  const { products, openProduct, cartOpen, viewing } = useShop();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", ...WELCOME }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function send(text: string) {
    const q = text.trim().slice(0, MAX_INPUT);
    if (!q || typing) return;
    setMsgs((m) => [...m, { from: "you", text: q }]);
    setInput("");
    setTyping(true);
    // A short pause so replies feel conversational rather than instant.
    timer.current = setTimeout(() => {
      setMsgs((m) => [...m, { from: "bot", ...botReply(q, products) }]);
      setTyping(false);
    }, 450 + Math.random() * 350);
  }

  const last = msgs[msgs.length - 1];

  return (
    // Hidden (not unmounted) while the bag or a product popup is open, so the conversation is kept.
    <div className="chat-root" hidden={cartOpen || !!viewing}>
      {open && (
        <section className="chat" role="dialog" aria-label="MELI assistant">
          <header className="chat-head">
            <div>
              <p className="chat-title">MELI assistant</p>
              <p className="chat-sub">Usually replies instantly</p>
            </div>
            <button type="button" className="chat-x" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </header>

          <div className="chat-list" ref={listRef} aria-live="polite">
            {msgs.map((m, i) =>
              m.from === "you" ? (
                <p key={i} className="chat-msg you">{m.text}</p>
              ) : (
                <div key={i} className="chat-bot">
                  <p className="chat-msg bot">{m.text}</p>
                  {!!m.products?.length && (
                    <div className="chat-cards">
                      {m.products.map((id) => {
                        const p = products.find((x) => x.id === id);
                        if (!p) return null;
                        return (
                          <button key={id} type="button" className="chat-card" onClick={() => openProduct(id)}>
                            <span className="chat-card-img"><Photo src={p.image} alt="" sizes="56px" /></span>
                            <span className="chat-card-name">{p.name}</span>
                            <span className="chat-card-price">{formatPrice(p.price)}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {!!m.links?.length && (
                    <div className="chat-links">
                      {m.links.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label} →</Link>)}
                    </div>
                  )}
                </div>
              ),
            )}
            {typing && <p className="chat-msg bot chat-typing" aria-label="Assistant is typing"><span /><span /><span /></p>}
          </div>

          {last.from === "bot" && !!last.chips?.length && !typing && (
            <div className="chat-chips">
              {last.chips.map((c) => <button key={c} type="button" onClick={() => send(c)}>{c}</button>)}
            </div>
          )}

          <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={MAX_INPUT}
              placeholder="Ask about sizes, delivery, returns…"
              aria-label="Your message"
              autoComplete="off"
            />
            <button type="submit" disabled={!input.trim() || typing} aria-label="Send">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className={`chat-fab${open ? " open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Chat with us"}
      >
        {open ? (
          <span aria-hidden="true" className="chat-fab-x">×</span>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
