import fs from "node:fs";
const dir = process.argv[2], out = process.argv[3];
const all = {};
for (const f of fs.readdirSync(dir).filter((f) => /^out_\d\.json$/.test(f)).sort()) Object.assign(all, JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8")));
fs.writeFileSync(out, JSON.stringify(all));
const c = {}; for (const v of Object.values(all)) c[v.service] = (c[v.service] ?? 0) + 1;
console.log("airports checked:", Object.keys(all).length, c);
