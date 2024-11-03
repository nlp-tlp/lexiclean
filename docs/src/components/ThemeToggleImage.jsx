import React from "react";
import { useColorMode } from "@docusaurus/theme-common";
import { Box } from "@mui/material";

const ThemeToggleImage = ({
  darkImg,
  lightImg,
  alt,
  width = "100%",
  centerInDiv = false,
  border,
  mx = 0,
  my = 0,
  caption,
}) => {
  const { colorMode } = useColorMode();
  const imageSrc = colorMode === "dark" ? darkImg : lightImg;
  const borderColor = border
    ? `1px solid ${colorMode === "dark" ? "grey" : "lightgrey"}`
    : "";

  const imageElement = (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      style={{ border: borderColor }}
    />
  );
  const content = caption ? (
    <figure style={{ textAlign: "center", fontStyle: "italic" }}>
      {imageElement}
      <figcaption>{caption}</figcaption>
    </figure>
  ) : (
    imageElement
  );

  return centerInDiv ? (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      mx={mx}
      my={my}
    >
      {content}
    </Box>
  ) : (
    content
  );
};

export default ThemeToggleImage;
