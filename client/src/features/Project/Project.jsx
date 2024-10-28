import { useState, useEffect, useContext } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Container,
  Grid,
  IconButton,
  Paper,
} from "@mui/material";
import { ProjectContext } from "../../shared/context/ProjectContext";
import Sidebar from "./sidebar/Sidebar";
import AnnotationTable from "./AnnotationTable";
import Paginator from "./Paginator";
import ProjectAppBar from "./AppBar";
import useProjectActions from "../../shared/hooks/api/project";
import EntitySelector from "./sidebar/EntitySelector";
import Contextualiser from "./sidebar/Contextualiser";

const Project = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [state, dispatch] = useContext(ProjectContext);
  const { getProjectProgress, getProject, getTexts } = useProjectActions();
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const initProject = async (page) => {
    // if (loading) {
    await getProjectProgress({ projectId });
    await getProject({ projectId });
    await getTexts({
      projectId,
      filters: state.filters,
      page: page,
      limit: state.pageLimit,
    });
    //   setLoading(false);
    // }
  };

  // useEffect(() => {
  //   // Load project
  //   if (loading) {
  //     initProject();
  //   }
  //   setLoading(false);
  // }, [projectId]);

  // useEffect(() => {
  //   // If projectId changes, reload data.
  //   setLoading(false);
  // }, [projectId, state.pageLimit]);

  // useEffect(() => {
  //   // Check if 'page' parameter is not present or is explicitly the empty string
  //   if (!searchParams.has("page") || searchParams.get("page") === "") {
  //     navigate(`/project/${projectId}?page=${page}`, { replace: true });
  //   }
  // }, [projectId, navigate, page]);

  // useEffect(() => {
  //   dispatch({ type: "SET_PAGE", payload: page });
  // }, [page]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    let page = searchParams.get("page");
    if (!page) {
      page = 1; // Default to page 1 if 'page' is not present
    }
    console.log(`Query parameter 'page' changed to: ${page}`);
    // Add your logic here to handle the change in query params
    // const fetchTexts = async () => {
    //   await getTexts({
    //     projectId,
    //     filters: state.filters,
    //     page: page,
    //     limit: state.pageLimit,
    //   });
    // };
    initProject(page);
  }, [location.search]);

  return (
    <Box display="flex">
      <CssBaseline />
      <ProjectAppBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: "auto",
          backgroundColor: "background.light",
        }}
      >
        <Container maxWidth="lg">
          <Grid container mt={12} spacing={2}>
            <Grid item xs={3}>
              <Sidebar />
            </Grid>
            <Grid item xs={9}>
              <Box display="flex" flexDirection="column">
                <Paginator />
                <Box
                  height="calc(100vh - 160px)"
                  overflow="auto"
                  id="annotation-table"
                >
                  <AnnotationTable />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Project;
