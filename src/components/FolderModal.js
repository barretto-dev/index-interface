import React, { useEffect, useState } from "react";
import "./styles/modal.css";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { getOutputFolders } from "../apiRequests/gaussianSplatting";
import { startSibr } from "../apiRequests/sbir";

function formatDate(dateString) {
  if (!dateString) return "Data indisponível";

  try {
    return new Date(dateString).toLocaleString("pt-BR");
  } catch {
    return dateString;
  }
}

export default function FolderModal({ open, onClose, onSuccess }) {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    let active = true;

    async function loadFolders() {
      try {
        setLoading(true);
        setError("");
        setFolders([]);
        setSelectedFolder("");

        const data = await getOutputFolders();

        if (!active) return;

        setFolders(data);

        if (data.length > 0) {
          setSelectedFolder(data[0].name);
        }
      } catch (err) {
        if (!active) return;
        setError(err.message || "Erro ao carregar pastas");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadFolders();

    return () => {
      active = false;
    };
  }, [open]);

  const handleStart = async () => {
    try {
      setSubmitting(true);
      setError("");

      if(selectedFolder === "")
        setError("Por favor seleciona uma pasta")
      else{
        await startSibr(selectedFolder);
        if (onSuccess) 
          onSuccess(selectedFolder);

        onClose();
      }
     
    } catch (err) {
      setError(err.message || "Erro ao iniciar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle className="modal-title">
        Selecionar pasta de saída
      </DialogTitle>

      <DialogContent className="modal-content" dividers>
        {loading && (
          <Box className="modal-loading">
            <CircularProgress size={20} />
            <Typography>Carregando pastas...</Typography>
          </Box>
        )}

        {!loading && error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && folders.length === 0 && (
          <Typography>Nenhuma pasta encontrada.</Typography>
        )}

        {!loading && !error && folders.length > 0 && (
          <RadioGroup
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
          >
            {folders.map((folder) => (
              <Box
                key={folder.name}
                sx={{
                  backgroundColor:"white",
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  mb: 1,
                }}
              >
                <FormControlLabel
                  value={folder.name}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography fontWeight={600}>{folder.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Criação: {formatDate(folder.createdAt)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Modificação: {formatDate(folder.modifiedAt)}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            ))}
          </RadioGroup>
        )}
      </DialogContent>

      <DialogActions className="modal-actions">
        <Button variant="contained" color="error" onClick={handleCancel} disabled={submitting}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleStart}
          disabled={
            submitting || loading || folders.length === 0 || !selectedFolder
          }
        >
          {submitting ? "Iniciando..." : "Iniciar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}