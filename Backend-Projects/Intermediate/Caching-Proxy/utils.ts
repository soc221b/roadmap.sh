export const getMediaType = (contentType: null | string): null | string => {
  return contentType?.split(" ")[0].replace(/;$/, "") ?? null;
};
