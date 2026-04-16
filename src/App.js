import React, { useState } from "react";
import logo from "./assets/logo-cimatec.png";
import { startSibr } from "./apiRequests/sbir";
import { downloadAndSaveZip, prepare } from "./apiRequests/image";
import { startTrain } from "./apiRequests/gaussianSplatting";
import './App.css';
import CameraWindow from "./components/CameraWindow";

import {Button, Stack} from "@mui/material";
import TrainTerminal from "./components/TrainTerminal";
import FolderModal from "./components/FolderModal";

function App() {

  const [folderModalOpen, setFolderModalOpen] = useState(false);

  const handleStartSibr = async () => {
    try {
      const res = await startSibr();
      console.log(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGetFrames = async () => {
    try {
      const msg = await downloadAndSaveZip();
      console.log(msg);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrepareFrames = async () => {
    try {
      const msg = await prepare();
      console.log(msg);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartTrain = async () => {
    try {
      const result = await startTrain();
      console.log(result.message);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app">

      {/* MENU SUPERIOR */}
      <header className="header">
        <img src={logo} alt="Logo" className="logo-img" />
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="container">
        
        {/* LADO ESQUERDO */}
        <div className="left">
          <div className="section">
            <CameraWindow/>
          </div>
        </div>

        {/* LADO DIREITO */}
        <div className="right">
          <div className="section">
             <Stack direction="column" spacing={1} sx={{ mb: 1 }}>
                <Button variant="contained" onClick={handleGetFrames}>Receber Frames</Button>
                <Button variant="contained" onClick={handlePrepareFrames}>Preparar Frames</Button>
                <Button variant="contained" onClick={handleStartTrain}>Iniciar Treinamento</Button>
                <Button variant="contained" onClick={() => setFolderModalOpen(true)}>Vizualizar</Button>
             </Stack>
          </div>

          <div className="section">
            <TrainTerminal/>
          </div>
        </div>
      </div>
      <FolderModal
        open={folderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        onSuccess={(folderName) => {
          console.log("SIBR iniciado com:", folderName);
        }}
      />
    </div>
  );
}

export default App;
