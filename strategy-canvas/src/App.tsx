import { LanguageProvider } from './context/LanguageContext';
import StrategyCanvas from './components/StrategyCanvas';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <StrategyCanvas />
    </LanguageProvider>
  );
};

export default App;