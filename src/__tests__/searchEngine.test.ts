import { searchEngineService } from '../services/SearchEngineService';

describe('searchEngineService', () => {
  it('builds a search URL for plain text queries', () => {
    const url = searchEngineService.search('khoj browser');
    expect(url).toContain('search');
    expect(url).toContain('q=khoj');
  });
});
