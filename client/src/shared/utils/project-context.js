export const updateTexts = (
  action,
  texts,
  textTokenIds,
  focusTokenId,
  replacement
) => {
  /**
   * Performs operations on a set of texts comprised of token(s) such as apply, accept, or delete.
   * `textTokenIds` is {textId: [tokenId, ..., tokenId]}`
   */

  return texts.map((text) => {
    const tokenIdsToUpdate = textTokenIds[text._id];

    if (!tokenIdsToUpdate) {
      // If no tokens to update, return text as is.
      return text;
    }

    const newTokens = text.tokens.map((token) => {
      if (tokenIdsToUpdate.includes(token._id)) {
        switch (action) {
          case "apply":
            if (focusTokenId === token._id) {
              // Only token action was applied to is a replacement, rest are suggestions.
              return {
                ...token,
                replacement: replacement,
                current_value: replacement,
              };
            } else {
              return {
                ...token,
                suggestion: replacement,
                current_value: replacement,
              };
            }
          case "delete":
            return {
              ...token,
              replacement: null,
              suggestion: null,
              current_value: token.value,
            };
          case "accept":
            return {
              ...token,
              replacement: token.suggestion,
              current_value: token.suggestion,
            };
          default:
            throw new Error("Token operation/action not specified correctly");
        }
      } else {
        return token;
      }
    });

    return {
      ...text,
      tokens: newTokens,
    };
  });
};

export const updateTextTokenTags = ({ action, texts, textTokenIds, tagId }) => {
  /**
   * Performs operations on a set of texts comprised of token(s) such as apply, accept, or delete.
   * `textTokenIds` is {textId: [tokenId, ..., tokenId]}`
   */

  return texts.map((text) => {
    const tokenIdsToUpdate = textTokenIds[text._id];

    if (!tokenIdsToUpdate) {
      // If no tokens to update, return text as is.
      return text;
    }

    const newTokens = text.tokens.map((token) => {
      if (tokenIdsToUpdate.includes(token._id)) {
        switch (action) {
          case "apply":
            return {
              ...token,
              tags: [...token.tags, tagId],
            };
          case "delete":
            return {
              ...token,
              tags: token.tags.filter((t) => t !== tagId),
            };
          // case "accept":
          //   return {
          //     ...token,
          //   };
          default:
            throw new Error("Token operation/action not specified correctly");
        }
      } else {
        return token;
      }
    });

    return {
      ...text,
      tokens: newTokens,
    };
  });
};
