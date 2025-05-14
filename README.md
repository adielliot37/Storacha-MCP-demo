#  Cross-Agent AI Pipeline using Storacha MCP & OpenAI

This project demonstrates a live multi-agent AI pipeline using the **MCP** with **Storacha** for decentralized file storage, and **OpenAI GPT-4** for agent intelligence.



---

##  Tech Stack

- **React** + Vite frontend
- **OpenAI GPT-4** for agent intelligence
- **Storacha MCP Storage Server (REST mode)** for decentralized data exchange
- **Base64 + CID** storage via IPFS/Filecoin


---

##  Agent Roles & Flow

This demo simulates 3 collaborating AI agents that operate in sequence:

| Agent        | Task                                                                 |
|--------------|----------------------------------------------------------------------|
|  Agent Alpha   | Generates a go-to-market strategy for an AR glasses startup         |
|  Agent Beta    | Expands the strategy into detailed SMART objectives                 |
|  Agent Gamma    | Converts those objectives into a 7-day execution timeline          |

Data is passed between agents **via MCP** using content-addressed files (CIDs), simulating decentralized agent memory exchange.

---

##  How MCP + Storacha Works

### Flow:

1. **Agent Alpha** generates data using OpenAI and uploads it to the Storacha MCP REST server.
2. MCP converts the file into a **Base64-encoded blob** and stores it via UCAN authorization into a **Storacha Space**.
3. The file gets a **CID** (content ID).
4. **Agent Beta** retrieves the file from MCP using the CID.
5. Data flows **trustlessly** without hardcoded file paths or centralized APIs.

###  MCP Tool Calls Used:

- `tools/call` → `"upload"`: stores file as Base64 + filename
- `tools/call` → `"retrieve"`: fetches file via CID + filename
- `tools/call` → `"identity"`: shows active DID key (optional)

---

##  Setup Instructions

###  Clone & Setup Project

```bash
# Clone the frontend
git clone https://github.com/yourname/agent-mcp-demo.git
cd agent-mcp-demo
```

### Install frontend dependencies
```bash
npm install
```
### Create .env file with your OpenAI key
```bash
echo "VITE_OPENAI_KEY=sk-..." > .env

```
## 📡 Start Storacha MCP Storage Server (REST Mode)

```bash
# Clone and install MCP server
git clone https://github.com/storacha/mcp-storage-server.git
cd mcp-storage-server
pnpm install

# Install w3cli and authenticate
npm install -g @web3-storage/w3cli
w3 login

# Create space and agent keys
w3 space create ai-agent-space
w3 key create

# Create delegation (replace <agent_id> with your actual AgentId)
w3 delegation create <agent_id> \
  --can 'store/add' \
  --can 'upload/add' \
  --base64

# Set environment variables and run the MCP server
export PRIVATE_KEY=your_private_key_base64
export DELEGATION=your_base64_delegation
export MCP_TRANSPORT_MODE=rest
export MCP_SERVER_PORT=3001
pnpm start:rest

# The server will run at:
# http://localhost:3001/rest

# Optionally expose it publicly using ngrok:
ngrok http 3001

# Update your frontend MCP_ENDPOINT to the public ngrok URL

# Then, from your agent-mcp-demo project directory:
npm run dev
```


##  Live Demo Flow

Click **Run AI Pipeline**

Agents will:

-  **Agent Alpha**: generate product launch strategy  
-  **Agent Beta**: expand into SMART objectives  
-  **Agent Gamma**: build a 7-day timeline  



---

## 🛠 Notes

- Fully client-side (no backend)
- Agent collaboration happens via decentralized storage (MCP + Storacha)
- Files are stored with verifiable CIDs using IPFS/Filecoin
- Easily extensible with more tools or agent behaviors

---

##  Example `tools/list` Response

```json
{
  "result": {
    "tools": [
      { "name": "identity" },
      { "name": "retrieve" },
      { "name": "upload" }
    ]
  }
}

```
cheers☕
