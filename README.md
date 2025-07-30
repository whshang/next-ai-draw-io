# Next AI Draw.io

A next.js web application that integrates AI capabilities with draw.io diagrams. This app allows you to create, modify, and enhance diagrams through natural language commands and AI-assisted visualization.

https://github.com/user-attachments/assets/c12dc58a-d227-409e-976a-1c8ad5404182

Demo site: [https://next-ai-draw-io.vercel.app/](https://next-ai-draw-io.vercel.app/)

## Features

-   **LLM-Powered Diagram Creation**: Leverage Large Language Models to create and manipulate draw.io diagrams directly through natural language commands
-   **Image-Based Diagram Replication**: Upload existing diagrams or images and have the AI replicate and enhance them automatically
-   **Diagram History**: Comprehensive version control that tracks all changes, allowing you to view and restore previous versions of your diagrams before the AI editing.
-   **Interactive Chat Interface**: Communicate with AI to refine your diagrams in real-time
-   **Smart Editing**: Modify existing diagrams using simple text prompts

## How It Works

The application uses the following technologies:

-   **Next.js**: For the frontend framework and routing
-   **@ai-sdk/react**: For the chat interface and AI interactions
-   **react-drawio**: For diagram representation and manipulation

Diagrams are represented as XML that can be rendered in draw.io. The AI processes your commands and generates or modifies this XML accordingly.

## Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/whshang/next-ai-draw-io
cd next-ai-draw-io
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:

```env
# OpenAI API 配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=your_openai_base_url_here
OPENAI_MODEL=your_openai_model_here

# 可选：其他 AI 服务配置
# OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 环境变量说明

- **OPENAI_API_KEY**: OpenAI API 密钥（必需）
- **OPENAI_BASE_URL**: OpenAI API 基础 URL（可选，默认为 OpenAI 官方 API）
  - 例如：`https://open.bigmodel.cn/api/paas/v4` (智谱 GLM)
  - 例如：`https://api.openai.com/v1` (OpenAI 官方)
- **OPENAI_MODEL**: 要使用的模型名称（可选，默认为 `gpt-4o`）
  - 例如：`glm-4.5`, `gpt-4o`, `gpt-3.5-turbo` 等
- **OPENROUTER_API_KEY**: OpenRouter API 密钥（如需使用其他模型提供商）

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Or you can deploy by this button.
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwhshang%2Fnext-ai-draw-io)

## Project Structure

```
app/                  # Next.js application routes and pages
  extract_xml.ts      # Utilities for XML processing
components/           # React components
  chat-input.tsx      # User input component for AI interaction
  chatPanel.tsx       # Chat interface with diagram control
  ui/                 # UI components (buttons, cards, etc.)
lib/                  # Utility functions and helpers
  utils.ts            # General utilities including XML conversion
public/               # Static assets including example images
```

## TODOs

-   [ ] Allow the LLM to modify the XML instead of generating it from scratch everytime.
-   [x] Improve the smoothness of shape streaming updates.

## License

This project is licensed under the MIT License.

## Support & Contact

For support or inquiries, please open an issue on the GitHub repository or contact the maintainer at:

-   Email: me[at]jiang.jp

---
