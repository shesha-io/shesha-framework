export function extractPathsSimple(jsCode: string): string[] {
  const pattern = /\b(?<url>(dynamic|no-auth)\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(?:\?[a-zA-Z0-9_=&%-]*)?\b/g;
  const paths: string[] = [];
  let match: RegExpExecArray | null = null;

  while ((match = pattern.exec(jsCode)) !== null) {
    const url = match.groups?.["url"];
    if (url)
        paths.push(url);
  }

  return paths;
}

const fs = require('fs');
const path = require('path');


describe('When parse test JS', () => {
    const textContent = fs.readFileSync(path.join(__dirname, 'testScript.txt'), 'utf8');
    const extractedUrls = extractPathsSimple(textContent);
  
    test('Then I expect 4 matches', () => {
      expect(extractedUrls.length).toEqual(4);
  });
});
