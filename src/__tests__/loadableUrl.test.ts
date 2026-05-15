import { HOME_ROUTE, toWebviewSrc, isInternalRoute } from '../utils/loadableUrl';

describe('loadableUrl', () => {
  it('maps home route to a data URL', () => {
    const src = toWebviewSrc(HOME_ROUTE);
    expect(src.startsWith('data:text/html')).toBe(true);
  });

  it('passes through normal https URLs', () => {
    expect(toWebviewSrc('https://example.com')).toBe('https://example.com');
  });

  it('detects internal khoj routes', () => {
    expect(isInternalRoute('khoj://downloads')).toBe(true);
    expect(isInternalRoute('https://example.com')).toBe(false);
  });
});
