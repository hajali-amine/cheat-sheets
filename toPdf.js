import { promises as fsp } from "fs";
import p, { join } from "path";
import { mdToPdf } from "md-to-pdf";

/**
 *
 * @param {string} path
 * @param {string[]} ignore
 * @returns {Promise<string[]>}
 */
const getMDFiles = async (path, ignore) => {
  const dir = await fsp.readdir(path);
  const r = await Promise.all(
    dir
      .map((e) => join(path, e))
      .filter((e) => !ignore.some((e1) => e1 === e))
      .map(async (e) =>
        (await fsp.stat(e)).isFile() ? e : getMDFiles(e, ignore)
      )
  );
  return r.flatMap((e) => e).filter((e) => e.endsWith(".md"));
};

const work = async () => {
  const all = await getMDFiles("./", ["node_modules", ".git"]);
  all.map(async (e) => {
    const pdf = await mdToPdf({ path: e }).catch(console.error);
    const temp = p.parse(e);
    const newName = p.format({
      root: join(temp.dir, temp.name),
      ext: ".pdf",
    });
    if (pdf) await fsp.writeFile(newName, pdf.content);
  });
};

work();
