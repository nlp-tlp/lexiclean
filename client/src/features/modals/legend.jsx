import React, { useState, useEffect } from "react";
import axios from "../utils/api-interceptor";
import "./Modals.css";

const DEFAULT_CLASSES = {
  rp: "Replaced token",
  ua: "Unassigned token",
  st: "Suggested token",
  en: "English token (in-vocabulary)",
};

export const Legend = ({ projectId }) => {
  const [bgColourMap, setBgColourMap] = useState();
  const [coloursLoaded, setColoursLoaded] = useState(false);

  useEffect(() => {
    const fetchProjectMaps = async () => {
      if (!coloursLoaded) {
        const response = await axios.get(`/api/map/${projectId}`);
        if (response.status === 200) {
          setBgColourMap(response.data.colour_map);
          setColoursLoaded(true);
        }
      }
    };
    fetchProjectMaps();
  }, [coloursLoaded]);

  return (
    <div>
      <p>
        This legend indicates colours assigned classes/meta-tags that are used
        to conextualise tokens
      </p>
      {coloursLoaded ? (
        <div className="legend" id="container">
          <div class="legend" id="table">
            {Object.keys(bgColourMap).map((key) => (
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div
                  className="legend"
                  id="legend-item"
                  style={{ backgroundColor: bgColourMap[key] }}
                >
                  {key}
                </div>
                {Object.keys(DEFAULT_CLASSES).includes(key) ? (
                  <p style={{ margin: "auto" }}>{DEFAULT_CLASSES[key]}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <h2>Loading...</h2>
      )}
    </div>
  );
}
