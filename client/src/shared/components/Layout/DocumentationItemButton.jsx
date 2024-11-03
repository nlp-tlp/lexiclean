import ArticleIcon from "@mui/icons-material/Article";
import { IconButton, Tooltip } from "@mui/material";

const DocumentationItemButton = () => (
  <Tooltip
    title={
      import.meta.env.VITE_DOCS_URL
        ? "Documentation"
        : "Documentation URL not configured"
    }
  >
    <span>
      <IconButton
        component="a"
        href={import.meta.env.VITE_DOCS_URL || "#"}
        target="_blank"
        rel="noopener noreferrer"
        disabled={!import.meta.env.VITE_DOCS_URL}
        sx={{ opacity: import.meta.env.VITE_DOCS_URL ? 1 : 0.5 }}
      >
        <ArticleIcon />
      </IconButton>
    </span>
  </Tooltip>
);

export default DocumentationItemButton;
