.PHONY: install dev build preview test test-unit test-network test-terminal test-terminal-llm test-terminal-settings test-content test-device test-schemas test-api test-architecture test-contracts test-machines test-interactions test-harness architecture-check architecture-report lint format format-check typecheck check ci qa

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

test-network:
	pnpm test:network

test-terminal:
	pnpm test:terminal

test-terminal-llm:
	pnpm test:terminal:llm

test-terminal-settings:
	pnpm test:terminal:settings

test-content:
	pnpm test:content

test-device:
	pnpm test:device

test-schemas:
	pnpm test:schemas

test-api:
	pnpm test:api

test-architecture:
	pnpm test:architecture

test-contracts:
	pnpm test:contracts

test-machines:
	pnpm test:machines

test-interactions:
	pnpm test:interactions

test-harness:
	pnpm test:harness

architecture-check:
	pnpm architecture:check

architecture-report:
	pnpm architecture:report

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

ci: check

qa: check
