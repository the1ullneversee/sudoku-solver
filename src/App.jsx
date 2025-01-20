import {Routes, Route} from "react-router-dom";
import GameProfile from "./Components/GameProfile.jsx";
import Board from "./Components/Board.jsx"

function App() {

  return (
      <div className="App">
          <Routes>
              <Route path="/" element={<GameProfile/>}/>
              <Route path="/board" element={<Board/>}/>
          </Routes>
      </div>
  );
}

export default App