import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StarknetProvider } from './providers/StarknetProvider';
import Home from './pages/Home';
import Lobby from './components/lobby/Lobby';
import Deploy from './pages/Deploy';
import Game from './pages/Game';

function App() {
  return (
    <StarknetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/deploy/:gameId" element={<Deploy />} />
          <Route path="/game/:gameId" element={<Game/>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StarknetProvider>
  );
}

export default App;