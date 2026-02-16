.PHONY: install dev build preview test lint format format-check typecheck check ci

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

preview:
	pnpm preview

test:
	pnpm test

lint:
	pnpm lint

format:
	pnpm format

format-check:
	pnpm format:check

typecheck:
	pnpm typecheck

check:
	pnpm check

ci: lint format-check test typecheck

