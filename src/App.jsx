import {useContext, useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Logo from './assets/logo.svg'
import {Routes, Route} from "react-router-dom";
import './App.css'
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