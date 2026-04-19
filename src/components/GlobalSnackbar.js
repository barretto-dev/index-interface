import React from "react";
import { Snackbar, Alert } from "@mui/material";

export default function GlobalSnackbar({
  open,
  message,
  severity = "success", // success | error | warning | info
  duration = 3000,
  onClose,
}) {
  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}