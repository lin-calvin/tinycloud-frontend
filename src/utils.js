export function cleanPath(pathstr) {
  return (
    "/" +
    pathstr
      .split("/")
      .filter((x) => x != "")
      .join("/")
  );
}
export function setCookie(key, value, exp) {
  document.cookie = key + "=" + value + ((exp && "; max-age=" + exp) || "");
}

export function getCookie(key) {
  var name = key + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return undefined;
}
