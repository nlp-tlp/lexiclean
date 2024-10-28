import { Stack, Typography } from "@mui/material";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";

const BrandToolbar = () => {
  return (
    <Stack direction="row" alignItems="center" spacing={2} ml={1}>
      <BubbleChartIcon sx={{ color: "primary.main" }} />
      <Typography fontWeight={500} fontSize={20} sx={{ color: "primary.main" }}>
        LexiClean
      </Typography>
    </Stack>
  );
};

export default BrandToolbar;
