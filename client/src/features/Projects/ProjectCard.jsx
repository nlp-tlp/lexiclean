import {
  Grid,
  Button,
  Typography,
  Stack,
  Box,
  Paper,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { truncateText } from "../../shared/utils/general";
import ArticleIcon from "@mui/icons-material/Article";
// import InsightsIcon from "@mui/icons-material/Insights";
import SettingsIcon from "@mui/icons-material/Settings";

const ProjectCard = ({ index, project }) => {
  const projectProperties = [
    {
      value: project.texts,
      title: "Total Texts",
      icon: <ArticleIcon fontSize="inherit" color="inherit" />,
    },
    {
      value: `${project.saved_texts} / ${project.texts} (${(
        (project.saved_texts / project.texts) * 100 || 0
      ).toFixed(0)}%)`,
      title: "Texts Annotated",
      icon: <ArticleIcon fontSize="inherit" color="inherit" />,
    },
    // {
    //   value: `${Math.round(project.vocabReduction)}%`,
    //   title: "Vocabulary reduction",
    //   icon: <InsightsIcon fontSize="inherit" color="inherit" />,
    // },
    // {
    //   value: `${project.startCandidateVocabSize - project.oovCorrections}
    //   / ${project.startCandidateVocabSize}`,
    //   title: "Vocabulary corrections",
    //   icon: <InsightsIcon fontSize="inherit" color="inherit" />,
    // },
    {
      value: project.isParallelCorpusProject ? "Parallel" : "Standard",
      title: "Project Type",
      icon: <SettingsIcon fontSize="inherit" color="inherit" />,
    },
  ];

  return (
    <Grid
      item
      xs={12}
      md={12}
      lg={6}
      xl={6}
      key={`project-grid-item-${project._id}`}
    >
      <Paper key={index} elevation={0}>
        <Box p={2} display="flex" justifyContent="space-between">
          <Typography variant="h6" color="text.secondary">
            #{index + 1}
          </Typography>
          <Tooltip title={`Description: ${project.description}`}>
            <Typography variant="h6" gutterBottom sx={{ cursor: "help" }}>
              {truncateText(project.name, 50)}
            </Typography>
          </Tooltip>
        </Box>
        <LinearProgress
          value={(project.savedCount / project.textCount) * 100}
          variant="determinate"
        />
        <Box display="flex" p={2}>
          <Stack direction="column" spacing={2}>
            {projectProperties.map((p) => (
              <StyledProperty value={p.value} title={p.title} icon={p.icon} />
            ))}
          </Stack>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          p={1}
          sx={{ backgroundColor: "background.accent" }}
        >
          <Typography fontSize={12} color="text.secondary">
            Created: {new Date(project.created_at).toDateString()}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              color="primary"
              variant="outlined"
              component={Link}
              to={`/dashboard/${project._id}`}
              size="small"
              startIcon={<DashboardIcon />}
            >
              Dashboard
            </Button>
            <Button
              component={Link}
              color="primary"
              variant="contained"
              to={`/project/${project._id}`}
              startIcon={<ModeEditIcon />}
              disableElevation
              size="small"
            >
              Annotate
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Grid>
  );
};

const StyledProperty = ({ title, value, icon }) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ color: "text.secondary" }}
    >
      {icon}
      <Typography fontSize={12}>{title}:</Typography>
      <Typography fontSize={12}>{value}</Typography>
    </Stack>
  );
};

export default ProjectCard;
