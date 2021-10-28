import ReactDOM from "react-dom";
import { useSelector, useDispatch } from "react-redux";

import {
  setActiveModal,
  selectProject,
  selectActiveModal,
} from "./projectSlice";

import { selectproject } from "./feedSlice";

import { Button, Modal } from "react-bootstrap";

// Modal components
import { Legend } from "../../project/modals/legend";
import { Help } from "../../project/modals/help";
import { Settings } from "../../project/modals/settings";
import { Schema } from "../../project/modals/schema";
import { Downloads } from "../../project/modals/downloads";
import { Create } from "../../project/modals/create";
import { Delete } from "../../project/modals/delete";
import { Annotate } from "../../project/modals/annotate";

export const PortalModal = () => {
  const dispatch = useDispatch();
  const project = useSelector(selectProject);
  const activeModal = useSelector(selectActiveModal);

  const modalContent = {
    legend: {
      title: "Legend",
      body: <Legend projectId={project._id} />,
    },
    help: {
      title: "LexiClean - Quick Reference Guide (QRG)",
      body: <Help />,
      modalSize: "modal-wide",
    },
    settings: {
      title: "Settings",
      body: <Settings />,
    },
    schema: {
      title: "Modify Schema",
      body: <Schema projectId={project._id} />,
    },
    downloads: {
      title: `Downloads (${project && project.name})`,
      body: (
        <Downloads
          projectId={project && project._id}
          projectName={project && project.name}
        />
      ),
      modalSize: "modal-wide",
    },
    create: {
      title: "Create New Project",
      body: <Create />,
      modalSize: "modal-wide",
    },
    delete: {
      title: "Delete Project",
      body: (
        <Delete
          projectId={project && project._id}
          projectName={project && project.name}
        />
      ),
    },
    annotate: {
      title: `Annotate Project (${project && project.name})`,
      body: <Annotate projectId={project && project._id} />,
    },
  };

  if (!activeModal) return null;
  return ReactDOM.createPortal(
    <Modal
      show={activeModal}
      onHide={() => dispatch(setActiveModal(null))}
      keyboard={false}
      dialogClassName={modalContent[activeModal].modalSize}
    >
      <Modal.Header>
        <Modal.Title>{modalContent[activeModal].title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{modalContent[activeModal].body}</Modal.Body>
      <Modal.Footer style={{ justifyContent: "left" }}>
        <Button
          variant="secondary"
          onClick={() => dispatch(setActiveModal(null))}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>,
    document.body
  );
};
