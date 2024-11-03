import GitHubIcon from "@mui/icons-material/GitHub";
import { IconButton, Tooltip } from "@mui/material";

const GitHubItemButton = () => (
  <Tooltip
    title={
      import.meta.env.VITE_GITHUB_URL ? "GitHub" : "GitHub URL not configured"
    }
  >
    <span>
      <IconButton
        component="a"
        href={import.meta.env.VITE_GITHUB_URL || "#"}
        target="_blank"
        rel="noopener noreferrer"
        disabled={!import.meta.env.VITE_GITHUB_URL}
        sx={{ opacity: import.meta.env.VITE_GITHUB_URL ? 1 : 0.5 }}
      >
        <GitHubIcon />
      </IconButton>
    </span>
  </Tooltip>
);

export default GitHubItemButton;
