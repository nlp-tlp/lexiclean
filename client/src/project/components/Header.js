import React, { useState, useEffect } from "react";
import axios from "../../common/utils/api-interceptor";
import { createUseStyles } from "react-jss";
import {
  Container,
  Row,
  Col,
  Spinner,
  InputGroup,
  FormControl,
  Button,
  ButtonGroup,
  DropdownButton,
  Dropdown,
} from "react-bootstrap";
import { MdSave } from "react-icons/md";

import NavBar from "../../common/components/navbar";

const useStyles = createUseStyles({
  header: {
    maxWidth: "100%",
    width: "100vw!important",
    position: "sticky",
    top: "0",
  },
  metricsContainer: {
    display: "inline-block",
    backgroundColor: "#A2D2D2",
    margin: "auto",
    padding: "0.2em 0.5em 0em 0.5em",
    borderRadius: "0.5em",
  },
  menu: {
    marginRight: "1em",
    padding: "0.25em",
    display: "flex",
  },
  save: {
    marginLeft: "0.25em",
    fontSize: "36px",
    color: "grey",
    cursor: "pointer",
  },
});

export default function Header({
  project,
  currentTexts,
  setShowDownload,
  setShowProgress,
  setShowSettings,
  setShowOverview,
  setShowLegend,
  setShowModifySchema,
  setShowHelp,
  pageChanged,
  saveTrigger,
  setSaveTrigger,
  savePending,
  setSavePending,
  searchTerm,
  setSearchTerm,
}) {
  const classes = useStyles();

  const username = localStorage.getItem("username");

  const navbarProps = {
    project,
    setShowLegend,
    setShowDownload,
    setShowModifySchema,
    setShowSettings,
    setShowHelp,
    username,
  };

  return (
    <>
      <Container className={classes.header}>
        <NavBar {...navbarProps} />
      </Container>
    </>
  );
}
