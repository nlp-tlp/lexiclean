const minWidth = 3;

export const getTokenWidth = (value) =>
  `${Math.max(value.length + 1, minWidth)}ch`;
