import { Navbar } from "react-bootstrap";
import "./Footer.css";

export const Footer = () => {
  return (
    <Navbar
      fixed="bottom"
      className="footer"
      style={{
        width: "100%",
        flexDirection: "column",
      }}
    >
      <p>© UWA NLP-TLP Group 2021.</p>
      <p style={{ fontSize: "0.75rem" }}>
        Developed by Tyler Bikaun (
        <a
          href="https://github.com/4theKnowledge"
          target="_blank"
          rel="noreferrer"
          alt="github repository"
          style={{
            color: "#263238",
            fontWeight: "bold",
          }}
        >
          4theKnowledge
        </a>
        )
      </p>
    </Navbar>
  );
};
