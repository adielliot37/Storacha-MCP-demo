import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';

const MCP_ENDPOINT = "/rest";
const openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_KEY, dangerouslyAllowBrowser: true });

export default function App() {
  const [steps, setSteps] = useState([]);
  const [finalOutput, setFinalOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const logStep = (agent, action, content) => {
    setSteps((prev) => [
      ...prev,
      {
        id: uuidv4(),
        agent,
        action,
        content,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const callTool = async (agent, name, args) => {
    const payload = {
      jsonrpc: "2.0",
      id: Date.now().toString(),
      method: "tools/call",
      params: { name, arguments: args },
    };

    const res = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    const content = json?.result?.content?.[0]?.text;
    return content ? JSON.parse(content) : null;
  };

  const askOpenAI = async (agent, prompt) => {
    logStep(agent, "thinking", `Prompt: ${prompt}`);
    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });
    return res.choices[0].message.content;
  };

  const runPipeline = async () => {
    setSteps([]);
    setFinalOutput(null);
    setLoading(true);

    try {
     
      const strategy = await askOpenAI("Agent Alpha", "You're a business strategist AI. Generate a product launch plan for a new AR glasses startup in 5 bullet points.");
      logStep("Agent Alpha", "generated strategy", strategy);

      const encoded = btoa(unescape(encodeURIComponent(strategy)));
      const uploadRes = await callTool("Agent Alpha", "upload", { file: encoded, name: "strategy.txt" });
      const cid = uploadRes?.root?.['/'];
      logStep("Agent Alpha", "uploaded", `CID: ${cid}`);

    
      const retrieveRes = await callTool("Agent Beta", "retrieve", { filepath: `${cid}/strategy.txt` });
      const decoded = decodeURIComponent(escape(atob(retrieveRes.data)));
      logStep("Agent Beta", "retrieved strategy", decoded);

      const objectives = await askOpenAI("Agent Beta", `You're an execution planner AI. Expand this strategy into detailed SMART objectives:\n\n${decoded}`);
      logStep("Agent Beta", "expanded objectives", objectives);

     
      const timeline = await askOpenAI("Agent Gamma", `You're a project manager AI. Create a 7-day timeline based on these SMART objectives:\n\n${objectives}`);
      logStep("Agent Gamma", "execution timeline", timeline);

      setFinalOutput(timeline);
    } catch (e) {
      logStep("System", "error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#00ff88] p-6 font-mono flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 tracking-wider">🧠 Multi-Agent AI Console</h1>

      <button
        onClick={runPipeline}
        disabled={loading}
        className="bg-[#00ff88] hover:bg-[#00e67a] text-black font-bold py-2 px-6 rounded mb-8 shadow-lg"
      >
        {loading ? 'Processing...' : 'Run AI Pipeline'}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
        {steps.map(step => (
          <div key={step.id} className="bg-[#111] border border-[#00ff88] p-4 rounded shadow-md">
            <div className="text-xs text-[#00ff88] opacity-80 mb-1">{step.timestamp} — <strong>{step.agent}</strong> [{step.action}]</div>
            <pre className="text-sm text-[#ccffcc] whitespace-pre-wrap max-h-64 overflow-y-auto">{step.content}</pre>
          </div>
        ))}
      </div>

      {finalOutput && (
        <div className="bg-[#111] border border-[#00ff88] p-6 mt-10 w-full max-w-4xl rounded shadow-md">
          <h2 className="text-xl font-bold mb-3">🗓️ Final Execution Timeline</h2>
          <pre className="text-[#ccffcc] whitespace-pre-wrap text-sm">{finalOutput}</pre>
        </div>
      )}
    </div>
  );
}
