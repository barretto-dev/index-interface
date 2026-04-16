import React, { useState } from "react";
import logo from "./assets/logo-cimatec.png";
import { downloadAndSaveZip, prepare } from "./apiRequests/image";
import { startTrain } from "./apiRequests/gaussianSplatting";
import './App.css';
import {Button, Stack} from "@mui/material";

import CameraWindow from "./components/CameraWindow";
import TrainTerminal from "./components/TrainTerminal";
import FolderModal from "./components/FolderModal";
import ConfirmModal from "./components/ConfirmModal";

function App() {

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const [confirmModalTitle, setConfirmModalTitle] = useState("")
  const [confirmModalMessage, setConfirmModalMessage] = useState("")
  const [confirmModalAction, setConfirmModalAction] = useState(null)

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

  const handleConfirmModalOpen = (title, message, action) => {
      setConfirmModalTitle(title)
      setConfirmModalMessage(message)
      setConfirmModalAction(() => action)
      setConfirmModalOpen(true)
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
             <Stack direction="column" spacing={3} sx={{ mb: 1 }}>
                <Button variant="contained" onClick={handleGetFrames}>Receber Frames</Button>
                <Button variant="contained" onClick={handlePrepareFrames}>Preparar Frames</Button>
                <Button variant="contained" onClick={() =>{handleConfirmModalOpen(
                  "Iniciando treinamento", 
                  "Tem Certeza que deseja continuar?",
                  async () => { await startTrain();}
                )}}>
                  Iniciar Treinamento
                </Button>
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

      <ConfirmModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={confirmModalAction}
        title={confirmModalTitle}
        message={confirmModalMessage}
      />

    </div>
  );
}

export default App;
