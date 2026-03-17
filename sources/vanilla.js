import fetch from "node-fetch";

export default async function vanilla(version, res) {
    try {
        const manifest = await (await fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json")).json();
        let versioninfo = manifest.versions.find(v => v.id === version);

        if(!versioninfo && version !== "latest") return res.status(400).json({ error: true, msg: "Invalid Version Number!" });

        if(version === "latest") {
            versioninfo = manifest.versions.find(v => v.id === manifest.latest.release);
        }

        const versionurl = await (await fetch(versioninfo.url)).json();
        res.redirect(301, versionurl.downloads.server.url);
    } catch(e) {
        if(!res.headersSent) res.status(500).json({ error: true, msg: "Internal Server Error!" });
    }
}
