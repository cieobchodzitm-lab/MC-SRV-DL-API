import fetch from "node-fetch";

function semverLt(a, b) {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for(let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const na = pa[i] || 0;
        const nb = pb[i] || 0;
        if(na < nb) return true;
        if(na > nb) return false;
    }
    return false;
}

export default async function fabric(version, loader, installer, res) {
    try {
        const fabric = await (await fetch("https://meta.fabricmc.net/v2/versions")).json();
        if(!fabric.game.map(v => v.version).includes(version) && version !== "latest") return res.status(400).json({ error: true, msg: "Invalid Version Number!" });

        if(version === "latest") {
            const stable = fabric.game.find(s => s.stable);
            if(!stable) return res.status(500).json({ error: true, msg: "No Stable Game Version Available!" });
            version = stable.version;
        }

        const loaderinfo = await (await fetch(`https://meta.fabricmc.net/v2/versions/loader/`)).json();
        if(loader !== "latest" && semverLt(loader, "0.12.0")) return res.status(400).json({ error: true, msg: "Loader Version For Fabric Must Be At Least 0.12.0!" });

        if(!loaderinfo.map(l => l.version).includes(loader) && loader !== "latest") return res.status(400).json({ error: true, msg: "Invalid Loader Version!" });

        if(loader === "latest") {
            const stableLoader = loaderinfo.find(s => s.stable);
            if(!stableLoader) return res.status(500).json({ error: true, msg: "No Stable Loader Version Available!" });
            loader = stableLoader.version;
        }

        const installerinfo = await (await fetch(`https://meta.fabricmc.net/v2/versions/installer/`)).json();
        if(installer && installer !== "latest" && semverLt(installer, "0.8.0")) return res.status(400).json({ error: true, msg: "Installer Version For Fabric Must Be At Least 0.8.0!" });

        if(installer && installer !== "latest" && !installerinfo.map(i => i.version).includes(installer)) return res.status(400).json({ error: true, msg: "Invalid Installer Version!" });

        if(!installer || installer === "latest") {
            const stableInstaller = installerinfo.find(s => s.stable);
            if(!stableInstaller) return res.status(500).json({ error: true, msg: "No Stable Installer Version Available!" });
            installer = stableInstaller.version;
        }

        res.redirect(301, `https://meta.fabricmc.net/v2/versions/loader/${version}/${loader}/${installer}/server/jar`);
    } catch(e) {
        if(!res.headersSent) res.status(500).json({ error: true, msg: "Internal Server Error!" });
    }
}
