import { Box, Grid, Tooltip, Typography } from "@mui/material";
import StyledCard from "../../shared/components/StyledCard";
import { styled } from "@mui/material/styles";

const StyledBox = styled(Box)(({ theme }) => ({
  borderRadius: 2,
  p: 1,
  minHeight: 120,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  justifyContent: "center",
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.background.accent,
  userSelect: "none",
  cursor: "help",
  ":hover": {
    backgroundColor: theme.palette.background.active,
  },
}));

const Overview = ({ loading, data }) => {
  return (
    <StyledCard title="Overview" caption="Overview of current project progress">
      <Grid container spacing={2} justifyContent="center">
        {data.metrics.map((m, index) => (
          <Grid
            item
            key={index}
            xs={12}
            sm={6}
            md={4}
            lg={3}
            xl={2}
            sx={{
              minWidth: 80,
            }}
          >
            <Tooltip title={m.description} placement="bottom" arrow>
              <StyledBox>
                <Typography variant="subtitle1" sx={{ fontSize: 14 }}>
                  {m.name}
                </Typography>
                <Typography variant="h6" sx={{ fontSize: 20, mt: 1 }}>
                  {m.value}
                </Typography>
              </StyledBox>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </StyledCard>
  );
};

export default Overview;
