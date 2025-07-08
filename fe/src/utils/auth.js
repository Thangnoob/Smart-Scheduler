import Cookies from "js-cookie";

export function saveTokens(token, refreshToken) {
  Cookies.set("token", token, { expires: 1 });
  Cookies.set("refreshToken", refreshToken, { expires: 7 });
}

export function clearTokens() {
  Cookies.remove("token");
  Cookies.remove("refreshToken");
}
