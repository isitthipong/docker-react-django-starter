---
name: policy-app-creator
description: Create or update a full-stack app that follows the project policy, including secure Django CRUD APIs, React frontend layout, and standard app shell navigation with main menu, side menu, footer, and CRUD/filter/report/export actions.
---

# Policy App Creator

Use this skill when creating or updating an application in this repository.

## Goal

Create an app that follows the standards in [policy/sw_policy.txt](../../policy/sw_policy.txt), including a secure backend, a working CRUD flow, and a consistent UI shell with the required navigation and submenu items.

## Required repo conventions

- Backend code belongs in `backend/`.
- Frontend code belongs in `frontend/src/`.
- Use the existing Docker Compose project setup as the default deployment path.
- Preserve the project architecture: Django app for API logic, React app for UI shell and views, PostgreSQL for storage, Nginx for serving the frontend and API.
- This repo already contains a product CRUD example, so reuse it as the model for new apps unless the product is intentionally different.

## Mandatory compliance rules

- Follow [policy/sw_policy.txt](../../policy/sw_policy.txt) for maintainability, security, clarity, and deployment.
- Prefer descriptive domain names over generic placeholders.
- Use Django ORM for database work whenever possible.
- Avoid dangerous SQL construction and keep data access safe and testable.
- Use Docker-first execution and keep the app runnable from the repo root.
- Keep code small and focused; avoid unnecessary abstraction or caching unless justified.
- If an API contract changes, update Django and React together in the same change.

## CRUD requirement

Every app created with this skill MUST implement CRUD for the business entity.

Required backend pattern:

- model
- serializer
- API view or viewset
- URL routing
- list/create/update/delete endpoints

Required frontend pattern:

- list and display records
- create new records
- edit existing records
- delete records
- loading, empty, and error states

## Required frontend app shell

Every app must include the following UI shell elements:

### Top bar

- application logo or brand mark
- app name
- user or profile area placeholder if not implemented

### Main menu

- the app name must appear in the main menu
- menu items should describe the primary sections of the app

### Side menu

- the app name must appear in the side menu header or title
- include the main app sections or module links

### Footer

- app name and general footer information such as copyright or support text

## Required submenu items

For each app, the submenu must include these labels:

- CRUD
- Filter
- Report
- Export

The submenu items should map to real functionality such as:

- CRUD: create, list, edit, delete actions
- Filter: search box or filtering panel
- Report: summary or analytics view
- Export: CSV/Excel/PDF export action or export button

## Example app pattern used in this repo

The default example app should behave like this:

- App name: Product Hub
- Main menu: contains `Product Hub` and supporting navigation labels
- Side menu: contains `Product Hub` and section items
- Submenu: `CRUD`, `Filter`, `Report`, `Export`
- CRUD form: create/update/delete products
- Filter: search by product name
- Report: summary cards showing product count, stock, inventory value
- Export: CSV export for filtered list

## App creation workflow

When creating a new app:

1. Define the business entity and the app name.
2. Create the Django model and CRUD endpoints.
3. Add serializer and router configuration.
4. Build the frontend app shell with top bar, logo, main menu, side menu, and footer.
5. Add the app name in both main and side menu.
6. Add submenu items for CRUD, Filter, Report, and Export.
7. Connect the screen to the backend API.
8. Validate the end-to-end flow: list, create, update, delete, filter, report, export.
9. Keep it runnable through Docker Compose.

## Do not do

- Do not create an app without CRUD.
- Do not omit the app name from main menu and side menu.
- Do not miss the top bar, side menu, or footer.
- Do not use vague or generic menu labels without real app meaning.
- Do not make backend and frontend drift apart.

## Final validation checklist

Before finishing, confirm all of the following are true:

- a CRUD flow exists
- the app name is present in main menu and side menu
- submenu contains CRUD, Filter, Report, and Export
- top bar, logo, and footer are present
- frontend fetches and updates the API correctly
- the app is consistent with the policy and repository structure
