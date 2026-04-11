
import logo from "./assets/logo-cimatec.png";
import { startSibr } from "./apiRequests/sbir";
import './App.css';

import Button from "@mui/material/Button";

function App() {

    const handleStartSibr = async () => {
    try {
      const res = await startSibr();
      console.log(res);
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
          <div className="section">Esquerda</div>
        </div>

        {/* LADO DIREITO */}
        <div className="right">
          <div className="section">
            <Button variant="contained" onClick={handleStartSibr}>Iniciar SIBR</Button>
          </div>

          <div className="section">
            <p>Terminal fechado</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
