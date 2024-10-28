import { Box, Divider, Paper, Stack, Typography } from "@mui/material";

const StyledCard = ({ title, caption = null, children }) => {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Box>
        {title && (
          <>
            <Stack direction="column" p={2}>
              <Typography variant="h6" sx={{ color: "text.secondary" }}>
                {title}
              </Typography>
              {
                // If caption is provided, display it
                caption && <Typography variant="caption">{caption}</Typography>
              }
            </Stack>
            <Divider flexItem />
          </>
        )}
        <Box p={2}>{children}</Box>
      </Box>
      <Box sx={{ backgroundColor: "background.accent", height: 32 }} />
    </Paper>
  );
};

export default StyledCard;
