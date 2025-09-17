const HEADER_NAME = "cookie";
const SET_HEADER_NAME = "set-cookie";

function parseCookieHeader(httpHeaders) {
  const cookieHeader = httpHeaders[HEADER_NAME];
  if (typeof cookieHeader === "string" && cookieHeader.length > 0) {
    return cookieHeader.split(";").reduce((obj, item) => {
      const [key, value] = item.split("=").map((s) => s.trim());
      if (Object.hasOwn(obj, key)) {
        const arr = Array.isArray(obj[key]) ? arr : [obj[key]];
        arr.push(value);
        obj[key] = arr;
      } else {
        obj[key] = value;
      }
      return obj;
    }, {});
  }
  return null;
}

export { parseCookieHeader };
