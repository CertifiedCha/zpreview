# Lesson Preview

Static Next.js preview site for exported board JSON files.

## Add a board

1. Export or save a board JSON from the main editor.
2. Put the file in `content/boards`.
3. Name it with the URL slug you want, for example `motion-basics.json`.
4. Run `npm run build`.

That file becomes a static route:

```txt
/motion-basics/
```

The build output is written to `out/` because `next.config.ts` uses `output: "export"`.
