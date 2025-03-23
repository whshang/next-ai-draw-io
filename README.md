# Next AI Draw.io

A modern web application that integrates AI capabilities with draw.io diagrams. This tool allows you to create, modify, and enhance diagrams through natural language commands and AI-assisted visualization.

## Features

- **AI-Powered Diagram Creation**: Generate diagrams from natural language descriptions
- **Diagram Modification**: Edit existing diagrams using simple text commands
- **Image Processing**: Upload images to use as references for diagram creation
- **XML Extraction and Processing**: Parse and manipulate draw.io XML files
- **Interactive Chat Interface**: Communicate with AI to refine your diagrams in real-time
- **Diagram History**: Track and restore previous versions of your diagrams
- **Example Templates**: Quick-start with example prompts like "Draw a cat" or "Replicate this flowchart"

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/next-ai-draw-io.git
cd next-ai-draw-io
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
OPENAI_API_KEY=your_openai_api_key_here
# Add any other required environment variables
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Creating a New Diagram

Use the chat interface to describe the diagram you want to create:

```
Create a flowchart showing the user authentication process with login, validation, and dashboard access steps.
```

### Modifying an Existing Diagram

With an existing diagram open, use natural language to make changes:

```
Add a decision node after the validation step that redirects failed attempts to a retry page.
```

### Using Image References

Upload an image as a reference by clicking the attachment button in the chat interface. Then ask the AI to use it as inspiration:

```
Create a similar flowchart to this image but add two more steps at the end.
```

### Using Example Templates

Click on the example prompts in the interface to:
- Generate a cat diagram
- Replicate the example flowchart

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

## How It Works

The application uses the following technologies:
- **Next.js**: For the frontend framework and routing
- **OpenAI**: For natural language processing and diagram generation
- **@ai-sdk/react**: For the chat interface and AI interactions
- **draw.io XML**: For diagram representation and manipulation

Diagrams are represented as XML that can be rendered in draw.io. The AI processes your commands and generates or modifies this XML accordingly.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [draw.io Documentation](https://www.drawio.com/doc/) - learn about draw.io features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support & Contact

For support or inquiries, please open an issue on the GitHub repository or contact the maintainer at:

- Email: your.email@example.com
- Twitter: [@yourusername](https://twitter.com/yourusername)

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

Built with ❤️ using [Next.js](https://nextjs.org/) and OpenAI technology.
