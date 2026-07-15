# mapcrumbs-share

GitHub Pages site for MapCrumbs QR / HTTPS share links at **https://share.mapcrumbs.app**.

Source for this site lives in the main app repo under `share-web/`. Push updates from there:

```bash
rsync -av --delete share-web/ /path/to/mapcrumbs-share/
cd /path/to/mapcrumbs-share
git add -A && git commit -m "Update share landing" && git push
```

## DNS (GoDaddy)

Add a CNAME record:

| Host | Points to |
|------|-----------|
| `share` | `mganchas.github.io` |

In GitHub repo **Settings → Pages**, set custom domain to `share.mapcrumbs.app` and enable HTTPS.

## Android App Links fingerprint

`assetlinks.json` currently includes the **debug** keystore SHA-256 (local builds only).

Add your **release** signing certificate fingerprint from [Google Play Console](https://play.google.com/console) → App integrity → App signing key certificate, then update `.well-known/assetlinks.json` and redeploy.

## Verify after deploy

- https://share.mapcrumbs.app/share?d=… (landing page)
- https://share.mapcrumbs.app/.well-known/apple-app-site-association
- https://share.mapcrumbs.app/.well-known/assetlinks.json
