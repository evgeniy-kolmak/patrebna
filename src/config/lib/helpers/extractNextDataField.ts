export const extractNextDataField = (html: string, path?: string): any =>
  ((match) => {
    try {
      const data = JSON.parse(match?.[1] ?? '{}');
      return path ? path.split('.').reduce((o, k) => o?.[k], data) : data;
    } catch {
      return null;
    }
  })(
    html.match(
      /<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/,
    ),
  );
