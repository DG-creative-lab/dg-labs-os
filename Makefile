.PHONY: install dev build preview test test-unit test-auth test-network test-terminal test-content test-device test-schemas test-api lint format format-check typecheck check ci qa

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

test-unit:
	pnpm test:unit

test-auth:
	pnpm test:auth

test-network:
	pnpm test:network

test-terminal:
	pnpm test:terminal

test-content:
	pnpm test:content

test-device:
	pnpm test:device

test-schemas:
	pnpm test:schemas

test-api:
	pnpm test:api

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

qa: check
