import { Token } from "./token";
import "./Text.css";

export const Text = ({ tokenIds, textId }) => {
  return (
    <div className="text-container">
      {Object.values(tokenIds).map((tokenId) => {
        return <Token tokenId={tokenId} textId={textId} />;
      })}
    </div>
  );
};
