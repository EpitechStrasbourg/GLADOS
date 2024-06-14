export const removeDigitsFromEnd = (str: string): string => str.replace(/\d+$/, '');

export const capitalizeFirstCharacter = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const sliceAtChar = (str: string, char: string): string => {
  const index = str.indexOf(char);
  if (index === -1) {
    return str;
  }
  return str.slice(0, index);
};
