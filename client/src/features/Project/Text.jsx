import { Box } from "@mui/material";
import Token from "./Token";

export const Text = ({ text }) => {
  return (
    <Box
      component="div"
      key={text._id}
      sx={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      {text &&
        Object.keys(text.tokens).map((tokenIndex) => {
          const token = text.tokens[tokenIndex];
          const tokenId = token._id;

          return (
            <Token
              textId={text._id}
              token={token}
              tokenIndex={tokenIndex}
              key={tokenId}
            />
          );
        })}
    </Box>
  );
};
