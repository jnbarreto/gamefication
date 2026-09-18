# RPG dark dashboard UI

## Scope

Align the authenticated app shell and dashboard with the visual direction in `docs/Gemini_Generated_Image_tp8qtftp8qtftp8q.jpeg`.

## Acceptance criteria

1. WHEN the user opens the app THEN the shell SHALL use a dark RPG palette with matrix-green accents on panels, navigation, and primary actions.
2. WHEN the dashboard loads THEN the character hero SHALL reserve a portrait slot for a future image without rendering the reference artwork yet.
3. WHEN navigation is shown THEN active items SHALL appear as green pills; inactive items SHALL stay muted on the dark header.
4. WHEN the user toggles light mode THEN the existing theme system SHALL continue to work without breaking layout.

## Out of scope

- Embedding `docs/Gemini_Generated_Image_tp8qtftp8qtftp8q.jpeg` as a background or portrait.
- Backend changes.
