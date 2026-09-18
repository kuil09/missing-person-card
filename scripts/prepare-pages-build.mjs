import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve("dist/pages");
const publicAssetFolders = ["android", "iphone", "status"];

async function rewriteDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const filePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return rewriteDirectory(filePath);
      if (!/\.(?:css|html|js)$/.test(entry.name)) return;

      const source = await readFile(filePath, "utf8");
      const rewritten = publicAssetFolders.reduce(
        (result, folder) =>
          result.replaceAll(
            `/assets/${folder}/`,
            `/missing-person-card/assets/${folder}/`,
          ),
        source,
      );

      if (rewritten !== source) await writeFile(filePath, rewritten);
    }),
  );
}

await rewriteDirectory(outputRoot);
console.log("Prepared GitHub Pages build under /missing-person-card/.");
