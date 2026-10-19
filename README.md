# Muhammad Rafli Hafid — Portfolio

A static personal portfolio with Home, About, Projects, and Experiences pages.

## Local preview

Serve the repository with any static HTTP server, for example:

```sh
python -m http.server 8766 --bind 127.0.0.1
```

Open `http://127.0.0.1:8766/`. An HTTP server is required because the shared JavaScript loads JSON content.

## Website files

- `index.html`, `about.html`, `projects.html`, `experiences.html`: page content.
- `tokens.css` and `assets/studio.css`: design tokens and shared styles.
- `assets/studio.js`: galleries, project details, filters, navigation, and bass demo.
- `assets/portfolio-content.json`: project, experience, and equipment descriptions.
- `assets/media-map.json`: image/video collections and captions.
- `assets/photos/`: photographs, screenshots, video files, and posters.
- `assets/fonts/`: self-hosted fonts and their licences.
- `output/pdf/`: downloadable English and Indonesian CVs.

To update the English CV, replace `output/pdf/Muhammad_Rafli_Hafid_CV_English.pdf` with the new PDF. The existing download link keeps working.

This is a buildless site: no dependency installation or compilation is required. Configure a static host to serve the repository root.
