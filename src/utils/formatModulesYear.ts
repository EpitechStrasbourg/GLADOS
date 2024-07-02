export default (moduleName: string) => {
  const regex = /^B-([A-Z]+)-(\d+)$/;
  const match = moduleName.match(regex);

  if (match) {
    const identifier = match[1]; // Capture group for XXX
    let number = parseInt(match[2], 10);
    console.log(moduleName, identifier, number);
    number = Math.ceil(number / 100 / 2);
    return `PGE${number} ${identifier}`;
  }
  return null;
};
