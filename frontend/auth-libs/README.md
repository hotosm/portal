# Auth-libs (Dist Only)

**⚠️ This directory contains ONLY built artifacts from auth-libs.**

## Source Code

Source code is located at: `/home/willaru/dev/HOT/auth-libs/`

## Structure

```
auth-libs/
└── web-component/
    └── dist/          # Built JS bundles (copied from source)
        ├── hanko-auth.esm.js
        ├── hanko-auth.iife.js
        └── hanko-auth.umd.js
```

## To Update

1. Edit source: `cd /home/willaru/dev/HOT/auth-libs/`
2. Build: `./scripts/build.sh`
3. Distribute: `./scripts/distribute.sh`
4. Commit updated `dist/` in this repo

## DO NOT

- ❌ Edit source files here
- ❌ Edit dist/ files directly
- ❌ Add new source code to this directory

See `/home/willaru/dev/HOT/auth-libs/CLAUDE.md` for complete documentation.
