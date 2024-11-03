import StyledCard from "../../shared/components/StyledCard";
import SchemaEditor from "../../shared/components/SchemeEditor";
import { Alert, AlertTitle, Box } from "@mui/material";

const Schema = ({
  loading,
  data,
  handleUpdateSchema,
  updateFunction = null,
  createFunction = null,
  deleteFunction = null,
  disabled = false,
}) => {
  return (
    <StyledCard title="Schema" caption="Schema assigned to this project">
      <Box p="0rem 1rem">
        <Alert severity="info">
          <AlertTitle>Schema Modification</AlertTitle>
          This area allows you to adjust your project's entity schema. It's
          important to note that adding new or editing existing entity labels is
          possible, but removing them is not supported unless the label has not
          been used. Each entity label features a badge, reflecting the count of
          gazetteer words or phrases linked to it. These terms were used during
          the project setup for initial annotations. To select a label, simply
          left-click on it. If you wish to deselect a label, left-click on it
          once more.
        </Alert>
      </Box>
      {data && data.details.tags && (
        <SchemaEditor
          values={{
            tags: data.details.tags.map((t) => ({ ...t, data: [] })),
          }}
          updateValue={handleUpdateSchema}
          disableTextEditor={true}
          updateFunction={updateFunction}
          createFunction={createFunction}
          deleteFunction={deleteFunction}
          disabled={disabled}
        />
      )}
    </StyledCard>
  );
};

export default Schema;
