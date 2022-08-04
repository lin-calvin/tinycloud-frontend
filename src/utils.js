export function cleanPath(pathstr) {
  return (
    "/" +
    pathstr
      .split("/")
      .filter((x) => x != "")
      .join("/")
  );
}
