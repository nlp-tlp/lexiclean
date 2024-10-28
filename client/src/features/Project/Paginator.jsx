import { useContext } from "react";
import {
  Skeleton,
  Box,
  Pagination,
  Paper,
  PaginationItem,
} from "@mui/material";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ProjectContext } from "../../shared/context/ProjectContext";
// import useProjectActions from "../../shared/hooks/api/project";

const Paginator = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useContext(ProjectContext);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const page = parseInt(query.get("page") || "1", 10);

  console.log("page", page);

  const handleChangePage = (event, newPage) => {
    console.log(newPage);
    dispatch({ type: "SET_PAGE", payload: newPage });
    navigate(`/project/${state.projectId}?page=${newPage}`, {
      replace: true,
    });
  };

  return (
    <Box
      as={Paper}
      elevation={0}
      p={1}
      variant="outlined"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {!state.totalCount ? (
        <Skeleton variant="rectangular" width={300} height={40} />
      ) : Object.keys(state.texts).length === 0 ? null : (
        <Pagination
          component="div"
          count={Math.ceil(state.totalCount / state.pageLimit) ?? 0}
          page={page}
          renderItem={(item) => (
            <PaginationItem
              component={Link}
              to={`/project/${state.projectId}/?page=${item.page}`}
              {...item}
            />
          )}
        />
      )}
    </Box>
  );
};

export default Paginator;
