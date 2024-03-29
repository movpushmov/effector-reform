import { exec } from 'child_process';
import { readdir } from 'fs/promises';
import { join } from 'path';

const getDirectories = async (source: string) =>
  (await readdir(source, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

async function updateDeps() {
  const packages = await getDirectories(join(__dirname, 'packages'));

  for (const subPackage of packages) {
    exec(`cd ./packages/${subPackage} && npm i`);
  }
}

void updateDeps();
