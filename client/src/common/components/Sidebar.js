import React, { useState, useEffect } from "react";
import axios from "../utils/api-interceptor";
import history from "../utils/history";
import {
  FaSlidersH,
  FaUserCircle,
  FaInfoCircle,
  FaEdit,
  FaGripVertical,
  FaDownload,
  FaArrowAltCircleLeft,
} from "react-icons/fa";

import { Nav, Spinner } from "react-bootstrap";

import TextSearch from "../../project/components/TextSearch";

export default function Sidebar({
  project,
  pageChanged,
  saveTrigger,
  tempValue,
  setTempValue,
  searchTerm,
  setSearchTerm,
  setShowLegend,
  setShowDownload,
  setShowModifySchema,
  setShowSettings,
  setShowHelp,
}) {
  const [metrics, setMetrics] = useState();
  const username = localStorage.getItem("username");

  useEffect(() => {
    const fetchProgressInfo = async () => {
      if (project._id) {
        const response = await axios.get(`/api/project/counts/${project._id}`);
        if (response.status === 200) {
          setMetrics([
            {
              description: "Texts Annotated",
              detail: `${response.data.text.annotated} / ${response.data.text.total}`,
              value: `${Math.round(
                (response.data.text.annotated * 100) / response.data.text.total
              )}%`,
              title: "Texts that have had classifications or replacements.",
            },
            {
              description: "Vocabulary Reduction",
              detail: `${response.data.token.vocab_size} / ${project.metrics.starting_vocab_size}`,
              value: `${Math.round(
                (1 -
                  response.data.token.vocab_size /
                    project.metrics.starting_vocab_size) *
                  100
              )}%`,
              title:
                "Comparison between of current vocabulary and starting vocabulary",
            },
            {
              description: "OOV Corrections",
              detail: `${
                project.metrics.starting_oov_token_count -
                response.data.token.oov_tokens
              } / ${project.metrics.starting_oov_token_count}`,
              value: `${Math.round(
                ((project.metrics.starting_oov_token_count -
                  response.data.token.oov_tokens) *
                  100) /
                  project.metrics.starting_oov_token_count
              )}%`,
              title:
                "All tokens replaced or classified with meta-tags are captured",
            },
          ]);
        }
      }
    };
    fetchProgressInfo();
  }, [project, pageChanged, saveTrigger]);

  const menuItems = [
    {
      name: "Legend",
      trigger: () => setShowLegend(true),
      icon: <FaGripVertical className="icon" />,
    },
    {
      name: "Download Results",
      trigger: () => setShowDownload(true),
      icon: <FaDownload className="icon" />,
    },
    {
      name: "Modify Schema",
      trigger: () => setShowModifySchema(true),
      icon: <FaEdit className="icon" />,
    },
    {
      name: "Settings",
      trigger: () => setShowSettings(true),
      icon: <FaSlidersH className="icon" />,
    },
    {
      name: "Help",
      trigger: () => setShowHelp(true),
      icon: <FaInfoCircle className="icon" />,
    },
    {
      name: "Return To Feed",
      trigger: () => history.push("/feed"),
      icon: <FaArrowAltCircleLeft className="icon" />,
    },
  ];

  const textSearchProps = {
    tempValue,
    setTempValue,
    searchTerm,
    setSearchTerm,
  };

  return (
    <div className="sidebar">
      <Nav className="d-none d-md-block sidebar">
        <div className="sidebar-header">
          <h3>{project.name}</h3>
          <p>© UWA NLP-TLP Group 2021.</p>
        </div>

        <div className="sidebar-subheader">
          <h4>Filters</h4>
          <TextSearch {...textSearchProps} />
        </div>

        <div className="sidebar-subheader">
          <h4>Metrics</h4>
          {metrics ? (
            metrics.map((metric) => (
              <div className="metric" title={metric.title}>
                <p className="value">{metric.value}</p>
                <div className="detail-container">
                  <p className="detail">{metric.detail}</p>
                  <p className="description">{metric.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div style={{ margin: "auto" }}>
              <Spinner animation="border" size="sm" />
            </div>
          )}
        </div>
        <div className="sidebar-subheader">
          <h4>Menu</h4>
          {menuItems &&
            menuItems.map((item) => (
              <Nav.Item>
                <Nav.Link onClick={item.trigger}>
                  {item.icon}
                  {item.name}
                </Nav.Link>
              </Nav.Item>
            ))}
        </div>
        <div className="sidebar-subheader">
          <Nav.Link disabled>
            <FaUserCircle className="icon" />
            Signed in as: {username}
          </Nav.Link>
        </div>
      </Nav>
    </div>
  );
}
