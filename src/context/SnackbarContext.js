import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import GlobalSnackbar from "../components/GlobalSnackbar";

const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // success | error | warning | info
    duration: 6000,
  });

  const showSnackbar = useCallback(
    (message, severity = "success", duration = 6000) => {
      setSnackbar({
        open: true,
        message,
        severity,
        duration,
      });
    },
    []
  );

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  const value = useMemo(
    () => ({
      showSnackbar,
      closeSnackbar,
    }),
    [showSnackbar, closeSnackbar]
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}

      <GlobalSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        duration={snackbar.duration}
        onClose={closeSnackbar}
      />
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error("useSnackbar deve ser usado dentro de SnackbarProvider");
  }

  return context;
}