// ModalContext.js
import React, { createContext, useContext, useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { Divider, IconButton, Paper, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const DEFAULT_MODAL_TITLE = "Details";

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState(DEFAULT_MODAL_TITLE);

  const openModal = (content, title) => {
    setModalContent(content);
    setModalTitle(title);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalContent(null);
    setModalTitle(DEFAULT_MODAL_TITLE);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <Modal
        open={isOpen}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Paper
          variant="outlined"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxWidth: 600,
            minWidth: 300,
            bgcolor: "background.default",
            boxShadow: 24,
          }}
        >
          <Box
            height={48}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" sx={{ ml: 2 }}>
              {modalTitle}
            </Typography>
            <IconButton sx={{ mr: 1 }} onClick={closeModal}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Divider flexItem />
          <Box p={2}>{modalContent}</Box>
          <Box
            height={24}
            sx={{ borderRadius: "2px", backgroundColor: "background.accent" }}
          />
        </Paper>
      </Modal>
    </ModalContext.Provider>
  );
};
