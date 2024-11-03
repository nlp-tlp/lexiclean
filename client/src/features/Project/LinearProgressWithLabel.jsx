import { useContext, useEffect, useState } from "react";
import { LinearProgress, Box, Tooltip } from "@mui/material";
import { ProjectContext } from "../../shared/context/ProjectContext";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { ANNOTATION_SIDEBAR_WIDTH } from "../../shared/constants/layout";

const LinearProgressWithLabel = () => {
  const [{ progress }] = useContext(ProjectContext);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    // Show confetti when progress.value reaches 100 (100%)
    if (progress && progress.value === 100) {
      setShowConfetti(true);
      // Optionally, stop the confetti after a certain time
      const timer = setTimeout(() => setShowConfetti(false), 5000); // Stop after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [progress.value]);

  return (
    <Tooltip
      title={`Current annotation progress: ${progress.title}`}
      placement="top"
    >
      <Box sx={{ width: "100%", cursor: "help", position: "relative" }}>
        <LinearProgress
          variant="determinate"
          value={progress.value}
          sx={{ height: "6px" }}
        />
        {showConfetti && (
          <Confetti
            width={width - ANNOTATION_SIDEBAR_WIDTH - 8}
            height={height - 64}
          />
        )}
      </Box>
    </Tooltip>
  );
};

export default LinearProgressWithLabel;
