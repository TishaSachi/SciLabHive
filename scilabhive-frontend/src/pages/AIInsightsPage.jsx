import { useState, useRef, useEffect } from 'react';
import './AIInsightsPage.css';

const HINTS = [
  { icon: '🧪', title: 'Diagnose variance', text: 'Why is there variance in my results?' },
  { icon: '📈', title: 'Compare experiments', text: 'Compare my last 3 experiments' },
  { icon: '📝', title: 'Improve logging', text: 'What parameters should I log?' },
  { icon: '🔬', title: 'What to run next', text: 'What experiment should I run next?' },
];

// ── AI avatar icon ──
const AIIcon = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
    <circle cx="12" cy="17" r=".5" fill="currentColor" />
  </svg>
);

// ── Typing indicator ──
function TypingIndicator() {
  return (
    <div className="msg ai">
      <div className="msg-avatar"><AIIcon /></div>
      <div className="msg-bubble" style={{ padding: 0 }}>
        <div className="typing-bubble">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

export default function AIInsightsPage({ user }) {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const conversationRef           = useRef(null);
  const textareaRef               = useRef(null);
  const started                   = messages.length > 0;

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const autoResize = (el) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const setQuestion = (q) => {
    setInput(q);
    textareaRef.current?.focus();
  };

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || loading) return;

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLoading(true);

    try {
      // ── Replace this with your real API call ──
      // const response = await api.post('/ai/ask', {
      //   question: q,
      //   user_id: user?.id,
      // });
      // const answer = response.data.answer;

      // Placeholder simulated response
      await new Promise((r) => setTimeout(r, 1400));
      const answer = getSimulatedResponse(q);
      // ──────────────────────────────────────────

      setMessages((prev) => [...prev, { role: 'ai', text: answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'ai',
        text: 'Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">

      {/* ── Header ── */}
      <div className="ai-header">
        <div className="ai-page-title">AI Insights</div>
        <div className="ai-page-sub">Ask anything about your experiments</div>
      </div>

      {/* ── Hero — only shown before first message ── */}
      {!started && (
        <>
          <div className="ai-hero">
            <div className="ai-hero-icon"><AIIcon /></div>
            <div className="ai-hero-title">What would you like to know?</div>
            <div className="ai-hero-sub">
              Ask me anything about your experiments — patterns, anomalies,
              what to try next, or comparisons between runs.
            </div>
          </div>

          <div className="ai-hints">
            {HINTS.map((h) => (
              <div
                key={h.title}
                className="ai-hint-card"
                onClick={() => setQuestion(h.text)}
              >
                <div className="ai-hint-icon">{h.icon}</div>
                <div className="ai-hint-title">{h.title}</div>
                {h.text}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Conversation thread ── */}
      <div className="ai-conversation" ref={conversationRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.role}`}>
            <div className="msg-avatar">
              {msg.role === 'ai' ? <AIIcon /> : 'You'}
            </div>
            <div className="msg-bubble">{msg.text}</div>
          </div>
        ))}
        {loading && <TypingIndicator />}
      </div>

      {/* ── Input area ── */}
      <div className="ai-input-area">
        <div className="ai-input-box">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Ask about your experiments…"
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(e.target); }}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="ai-send-btn"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="ai-input-hint">Press Enter to send · Shift+Enter for new line</div>
      </div>

    </div>
  );
}

// ── Simulated responses — replace with real API later ──
function getSimulatedResponse(q) {
  const ql = q.toLowerCase();
  if (ql.includes('variance') || ql.includes('why'))
    return "The variance in your results is most likely caused by inconsistent reagent concentration between preparations, temperature fluctuation in the lab, or pipetting technique variation. I'd recommend recalibrating your standard solution and logging room temperature as a parameter in your next run.";
  if (ql.includes('pattern'))
    return "Across your experiments I can see 3 patterns: Chemistry experiments on Tuesdays show higher variance — possibly lab conditions. Your result logging drops off for experiments in progress for more than 5 days. Biochemistry experiments have the highest completion rate at 91%.";
  if (ql.includes('compare') || ql.includes('last 3'))
    return "Comparing your last 3 experiments: Enzyme Kinetics #3 shows an 18% increase in Vmax vs #2, pH Titration has a 0.3 pH variance at the equivalence point, and Spectroscopy Analysis is still awaiting results. The Enzyme Kinetics progression is the most promising trend.";
  if (ql.includes('param') || ql.includes('log'))
    return "The most impactful parameters to track more carefully are: temperature (missing in 60% of Chemistry experiments), preparation time for reagents, and humidity for Physics experiments. These three additions would significantly improve the reproducibility of your results.";
  if (ql.includes('next') || ql.includes('run'))
    return "Based on your current data gaps, I'd suggest running Enzyme Kinetics #4 next to confirm the upward Vmax trend. After that, completing the Spectroscopy Analysis results would give you a more complete picture of your Physics work.";
  return "Based on your experiment data, I can see some interesting trends worth exploring. Your Chemistry experiments show the most activity this month, and your result logging has improved over the past two weeks. Would you like me to go deeper on any specific experiment or pattern?";
}
