import fs from 'fs';
import path from 'path';

function recFindByExt(base: string, ext: string, files: string[] = null, result: string[] = null): string[] {
  files = files || fs.readdirSync(base);
  result = result || [];

  files.forEach(
    function (file) {
      var newbase = path.join(base, file);
      if (fs.statSync(newbase).isDirectory()) {
        result = recFindByExt(newbase, ext, fs.readdirSync(newbase), result);
      } else {
        if (file.substr(-1 * (ext.length + 1)) === '.' + ext) {
          result.push(newbase);
        }
      }
    },
  );
  return result;
}

export interface ComponentSettingsFile {
  fileName: string;
  componentName: string;
}

const settingsRegex = /\\designer-components\\(?<name>[^\n]+)\\[^\\]+\.json/gm;

export const GET = (_request: Request): Response => {
  const rootDir = path.resolve('./src');
  const jsonFiles = recFindByExt(rootDir, 'json');

  const commponentSettings: ComponentSettingsFile[] = [];

  jsonFiles.forEach((fileName) => {
    for (const match of fileName.matchAll(settingsRegex)) {
      commponentSettings.push({ fileName: fileName, componentName: match.groups.name });
    }
  });

  return Response.json(commponentSettings);
};
