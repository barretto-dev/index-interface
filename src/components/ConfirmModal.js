import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

import "./styles/modal.css";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirmação",
  message = "Deseja realmente executar esta ação?",
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError("");

      if (onConfirm) {
        await onConfirm();
      }

      onClose(); // fecha se sucesso
    } catch (err) {
      setError(err.message || "Erro ao executar ação");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
      <DialogTitle className="modal-title">{title}</DialogTitle>

      <DialogContent className="modal-content">
          <Typography sx={{marginTop:"15px"}} >{message}</Typography>

          {error && (
            <Alert severity="error" className="modal-error">
              {error}
            </Alert>
          )}
      </DialogContent>

      <DialogActions className="modal-actions">
        <Button 
          variant="contained"
          color="error"
          onClick={handleCancel} disabled={loading}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Confirmar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}