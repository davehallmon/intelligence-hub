# Repository Tests

This directory contains development-time Node fixtures and structural checks. Tests are not production browser entry points.

Use `<responsibility>.test.js` names and import production modules from `js/`. The canonical command is:

```bash
npm run validate
```

Source validation does not replace deployed browser/device acceptance for rendering, interaction, responsive layout, or remote-feed transport.
