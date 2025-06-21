export function urlToId(input) {
  if (!input) return '';
  try {
    const url = new URL(input);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.slice(1);
    }
    if (url.searchParams.has('v')) {
      return url.searchParams.get('v');
    }
    const parts = url.pathname.split('/');
    return parts[parts.length - 1];
  } catch (e) {
    return input.trim();
  }
}

export function idToUrl(id) {
  return `https://www.youtube.com/watch?v=${id}`;
}
