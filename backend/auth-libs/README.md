# Auth-libs (Dist Only)

**⚠️ This directory contains ONLY built artifacts from auth-libs.**

## Source Code

Source code is located at: `/home/willaru/dev/HOT/auth-libs/python/`

## Structure

```
auth-libs/
└── python/
    └── dist/          # Built Python wheel (copied from source)
        ├── hotosm_auth-0.1.0-py3-none-any.whl
        └── hotosm_auth-0.1.0.tar.gz
```

## To Update

1. Edit source: `cd /home/willaru/dev/HOT/auth-libs/python/`
2. Build: `cd ../.. && ./scripts/build.sh`
3. Distribute: `./scripts/distribute.sh`
4. Commit updated `dist/` in this repo

## DO NOT

- ❌ Edit source files here
- ❌ Edit dist/ files directly
- ❌ Add new source code to this directory

See `/home/willaru/dev/HOT/auth-libs/CLAUDE.md` for complete documentation.
