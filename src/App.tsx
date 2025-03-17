// App.tsx
import EnhancedChatInterface from "./components/chat/EnhancedChatInterface";

import { FrameContext } from "./components/providers/FarcasterProvider";

interface AppProps {
  frameContext: FrameContext;
}

const App: React.FC<AppProps> = ({ frameContext }) => {
  console.log("the frame context is: ", frameContext);
  return <EnhancedChatInterface frameContext={frameContext} />;
};

export default App;
