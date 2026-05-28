# MoveEasE — Claude Instructions

## Destructive Commands

Always ask the user for confirmation before running any destructive or hard-to-reverse commands, including but not limited to:

- `prisma db push --force-reset` — drops and recreates the entire database, wiping all data
- `prisma migrate reset` — resets the database
- `git reset --hard` — discards all local changes
- `git push --force` — overwrites remote history
- `rm -rf` / `Remove-Item -Recurse -Force` on non-temporary directories

When only a column drop is needed (e.g. `--accept-data-loss`), confirm with the user before proceeding and prefer the least destructive option available.
