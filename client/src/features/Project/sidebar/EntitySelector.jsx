import { useContext } from "react";
import { ProjectContext } from "../../../shared/context/ProjectContext";
import {
  Alert,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import useAnnotationActions from "../../../shared/hooks/api/annotation";
import CircleIcon from "@mui/icons-material/Circle";
import { truncateText } from "../../../shared/utils/general";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const EntitySelector = () => {
  const [state] = useContext(ProjectContext);
  const { applyLabelAction } = useAnnotationActions();
  const disabled = !state.selectedToken || !state.selectedToken.value;
  const tokenTagIds = state?.selectedToken?.tags ?? [];
  const containsTagId = (tagId) => tokenTagIds.includes(tagId);

  const handleApply = async ({ tokenId, tagId }) => {
    await applyLabelAction({
      textId: state.selectedTextId,
      tokenId,
      tagId,
    });
  };

  return (
    <Box
      as={Paper}
      sx={{ backgroundColor: "background.default" }}
      elevation={0}
      variant="outlined"
    >
      <Box>
        <Box p={2}>
          <Typography fontWeight="bold" color="text.secondary">
            Entity Labels
          </Typography>
          <Typography variant="caption">
            Select an entity label to apply to the selected token
          </Typography>
        </Box>
        <Divider />
        {!state.project || state.project.tags.length === 0 ? (
          <Box p={1} display="flex" flexDirection="column" alignItems="center">
            <Alert severity="info">
              No tags available. Visit project dashboard to create.
            </Alert>
          </Box>
        ) : (
          <Box p="0rem 1rem">
            <List>
              {state.project.tags.map((t) => (
                <Tooltip
                  title={`Descripton: ${t.description}`}
                  placement="left"
                  arrow
                >
                  <ListItemButton
                    key={`tag-${t._id}`}
                    sx={{
                      "&:hover": {
                        backgroundColor: alpha(t.color, 0.25),
                      },
                    }}
                    disabled={disabled || tokenTagIds.includes(t._id)}
                    onClick={() =>
                      handleApply({
                        tokenId: state.selectedToken._id,
                        tagId: t._id,
                      })
                    }
                  >
                    <Stack spacing={2} direction="row" alignItems="center">
                      <CircleIcon
                        sx={{
                          color: t.color,
                        }}
                        fontSize="small"
                      />
                      <ListItemText
                        primary={t.name}
                        secondary={
                          <Typography fontSize={10}>
                            {truncateText(t.description, 25)}
                          </Typography>
                        }
                      />
                    </Stack>
                  </ListItemButton>
                </Tooltip>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EntitySelector;
