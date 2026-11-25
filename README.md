# Mono4D — Project Page

Static project page for **Mono4D: Lifting Single-Image 3D Gaussian Reconstruction to Coherent 4D Scenes from Monocular Videos** (arXiv preprint).

No build step, no dependencies. Plain HTML/CSS/JS.

## Structure

```
site/
├── index.html              # password gate
├── page.html               # the actual page (behind the gate)
├── .nojekyll               # keep assets/ untouched on GitHub Pages
├── assets/
│   ├── css/style.css       # all styles
│   ├── js/main.js          # nav, reveal, lightbox, video previews, tabs, copy-bibtex
│   ├── figs/               # 6 paper figures (jpg, extracted from the LaTeX PDFs)
│   ├── videos/             # demo clips (h264 mp4) + poster jpgs
│   └── Mono4D_paper.pdf    # paper PDF
└── README.md
```

## Local preview

```bash
cd site
python3 -m http.server 8000
# open http://localhost:8000  → password gate
```

A local server is required (rather than opening `index.html` directly) so the videos
stream with HTTP range requests.

## Password gate

`index.html` is a small gate: it accepts a password, remembers the unlock in
`sessionStorage`, then redirects to `page.html`. `page.html` bounces back to the gate
when that flag is missing, so the page cannot be reached by typing its URL.

Only the SHA-256 digest is stored — never the plaintext. Change the password with:

```bash
./set-password.sh 'new-password'    # from the repository root
```

**This is a client-side lock, not real security.** It stops casual visitors and
keeps the page out of search engines (`noindex`), but anyone who reads the HTML can
fetch `page.html` and the assets directly. Use it for reviewers and collaborators,
not for anything that must stay confidential.

## Deploy to GitHub Pages

The deploy script needs a Personal Access Token because this machine cannot reach
`github.com` over ssh (blocked by policy).

1. Create a token at <https://github.com/settings/tokens> → *Generate new token
   (classic)*, scope `repo`.
2. Run:

```bash
GITHUB_USER=<your-username> GITHUB_TOKEN=<token> REPO=mono4d ./deploy.sh
```

The token is passed to a single `git push` through a one-shot HTTP header; it is
never written to `.git/config` or any file.

3. Then once, in the repository settings: **Pages → Deploy from a branch →
   main → / (root)**.

The site lives at `https://<your-username>.github.io/<repo>/`.

Without `GITHUB_TOKEN` the script still makes the local commit and prints the
token instructions, so you can push later without redoing anything.

## Deploy

Upload the contents of `site/` to any static host (GitHub Pages, Netlify, Vercel,
an nginx directory, or an S3 bucket). Set `index.html` as the entry point.

For GitHub Pages:

```bash
git init && git add . && git commit -m "Mono4D project page"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
# then: Settings → Pages → Deploy from branch → main / root
```

## Customising

| What | Where |
| --- | --- |
| Links (paper / code / arXiv) | `index.html`, the `.cta` block in the hero |
| Authors, affiliations | `index.html`, `.authors` / `.affils` |
| Numbers in tables | `index.html`, search for the metric name |
| Colours | `assets/css/style.css`, `:root` variables |
| BibTeX | `index.html`, `#bibText` |
| Video captions / categories | `index.html`, each `.vcard` (`data-cat`: `subject`, `object`, `compare`) |

## Sources

* Figures: rendered at 2–3× from `CVPR_2027_Mono4D_arxiv/figures/*.pdf`, then downscaled
  and re-encoded to progressive JPEG.
* Videos: cropped to remove the slides' black mattes and padded white borders, scaled to
  1280 px wide, re-encoded as H.264 (CRF 24, faststart, audio stripped).
* `lpips_bubble_infer.pdf` in the source figures is not a PDF (it is a binary data blob),
  so the bubble chart is taken from the teaser figure instead.

## Accessibility / performance notes

* All images are lazy-renderable and progressive; videos use `preload="none"` and load only
  when they approach the viewport.
* Controls respect `prefers-reduced-motion`; all interactive elements are keyboard reachable,
  and the lightbox closes with `Escape`.
* Total page weight ≈ 49 MB, dominated by the demo clips (19 MB) and the paper PDF (25 MB).
  Drop or re-encode the `compare-*` clips if you need a lighter page.
