import React, { useEffect, useState } from "react";
import "./styles/modal.css";
import { deleteOutputFolder, getOutputFolders } from "../apiRequests/outputReq";
import { startSibr } from "../apiRequests/sbirReq";
import { useSnackbar } from "../context/SnackbarContext";
import ConfirmModal from "./ConfirmModal";

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
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";

import DeleteIcon from '@mui/icons-material/Delete';

function formatDate(dateString) {
  if (!dateString) return "Data indisponível";

  try {
    return new Date(dateString).toLocaleString("pt-BR");
  } catch {
    return dateString;
  }
}

export default function FolderModal({ open, onClose, onSuccess }) {

  const { showSnackbar } = useSnackbar();

  const [folders, setFolders] = useState([]);
  const [selectedFolderIndex, setSelectedFolderIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [folderToDelete, setFolderToDelete] = useState(0)


  useEffect(() => {
    if (!open) return;

    let active = true;

    async function loadFolders() {
      try {
        setLoading(true);
        setError("");
        setFolders([]);
        setSelectedFolderIndex(null);

        const data = await getOutputFolders();
        if (!active) return;

        setFolders(data);
        if (data.length > 0) setSelectedFolderIndex(0);

      } catch (err) {
        if (!active) return;
        setError(err.message || "Erro ao carregar pastas");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFolders();
    return () => {active = false};

  }, [open]);

  const handleStart = async () => {
    try {
      setSubmitting(true);
      setError("");

      if(selectedFolderIndex === null)
        setError("Por favor seleciona uma pasta")
      else{
        const folder_selected = folders[selectedFolderIndex].name
        await startSibr(folder_selected);
        if (onSuccess) onSuccess(selectedFolderIndex);

        onClose();
      }
     
    } catch (err) {
      setError(err.message || "Erro ao iniciar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {if (!submitting) onClose()};

  const handleDeleteTrainningFolder = async () => {
    try {
      const folderName = folders[folderToDelete].name
      const {status, msg} = await deleteOutputFolder(folderName)

      if(status === "success"){
        folders.splice(folderToDelete,1)
        setFolderToDelete(folders)
      }

      showSnackbar(msg, status)
    } catch (error) {
      console.error(error);
      showSnackbar("Erro inesperado na página", "error")
    }
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm">
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
            value={selectedFolderIndex}
            onChange={(e) => setSelectedFolderIndex(e.target.value)}
          >
            {folders.map((folder, index) => (
              <Box
                key={index}
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
                  value={index}
                  control={<Radio />}
                  label={
                    <Stack direction="row" spacing={3} sx={{ mb: 1 }}>
                      <Box>
                        <Typography fontWeight={600}>{folder.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Criação: {formatDate(folder.createdAt)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Modificação: {formatDate(folder.modifiedAt)}
                        </Typography>
                      </Box>
                      <IconButton 
                        color="error"
                        onClick={()=> {
                          setConfirmModalOpen(true)
                          setFolderToDelete(index)
                        }} 
                      >
                        <DeleteIcon/>
                      </IconButton>
                    </Stack>
                    // 
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
            submitting || loading || folders.length === 0 || selectedFolderIndex == null
          }
        >
          {submitting ? "Iniciando..." : "Iniciar"}
        </Button>
      </DialogActions>

       <ConfirmModal
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={handleDeleteTrainningFolder}
          title={"Confirmação de remoção de treinamento"}
          message={"Tem certeza que deseja remover está pasta?"}
        />
    </Dialog>
  );
}