import { Box, Typography } from "@mui/material";
import React from "react";

const SectionHeader = ({ title }) => {
  return (
    <Box
      //   sx={{
      //     borderTop: "1px solid",
      //     borderColor: "prmary",
      //     borderBottom: "1px solid",
      //     // backgroundColor: "#11ff00",
      //   }}
      p={1}
      //   mb={2}
      //   mt={2}
    >
      <Typography variant="h6" fontWeight="bold" color="text.secondary">
        {title}
      </Typography>
    </Box>
  );
};

export default SectionHeader;
