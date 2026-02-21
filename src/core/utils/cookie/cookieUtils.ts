const extractCookieValue = (cookieString: string, cookieName: string) => {
  const regex = new RegExp(`${cookieName}=([^;]+)`);
  const match = cookieString.match(regex);
  return match ? match[1] : null;
}

const extractFromCookieArray = (cookieArray: string[], cookieName: string)  => {
  for (const cookieString of cookieArray) {
    const value = extractCookieValue(cookieString, cookieName);
    if (value) return value;
  }
  return null;
}

export {
  extractCookieValue,
  extractFromCookieArray,
}