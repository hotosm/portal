# HOT Portal

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)

## Connect tools, data and people

A centralized web workspace that simplifies access to the open mapping ecosystem. 

### Try it here! [portal.hotosm.org](https://portal.hotosm.org)

## Roadmap 2027

✅ Done
⚙️ In progress

<!-- prettier-ignore-start -->
| Status | Feature |
|:--:| :-- |
|  | Navigation re-designed + landing pages
|  | Workflows
|  | Disaster dashboard
|  | Data browser & visualization
|  | Marketplace

## Roadmap 2026

✅ Done
⚙️ In progress

<!-- prettier-ignore-start -->
| Status | Feature |
|:--:| :-- |
|✅| Website published (portal.hotosm.org)
|✅| API published (portal.hotosm.org/api/docs)
|✅| Map for displaying data from all tools
|✅| HOT Accounts authentication
|✅| Menu for accessing HOT Tools
|✅| Language menu
|✅| Sections for Imagery, Mapping, Field and Data, for showing tools and user's data on each
|✅| Public integration with all tools
|✅| User data integration
|✅| Design and UI/UX improvements
|✅| Plans (grouping projects from multiple tools)
|✅| Organizations / teams management
|✅| Add project from third parties (MapSwipe, SketchMapTool) to plans
|✅| Add any HOT project to a plan by pasting its link
|✅| Collections, with categories and descriptions
|✅| Open Mapping Marketplace section
|✅| Public profiles
|✅| Integration with the HOT Learning Center
|⚙️| Maps for plans
|⚙️| Sharing & Permissions

## Install and run

1. Create a folder, you'll clone both Portal and the Login App there:

```bash
mkdir portal-project
cd portal-project
```

2. Login App:

```bash
git clone https://github.com/hotosm/login
```

3. Portal

```bash
git clone https://github.com/hotosm/portal
cd portal
cp .env.example .env
```

4. Start

This makefile command will launch both Portal and Login apps
in Docker:

```bash
make dev
```

In a new terminal, run migrations:

```bash
make migrate
```

Then, open `http://127.0.0.1:5173` for the frontend.


## License

This is free software! you may use this project under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
