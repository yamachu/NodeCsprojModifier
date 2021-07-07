TARGET_FILE = 
TARGET_DIR = .
TARGET_FRAMEWORK =

init:
	yarn install

build:
	npx tsc

build/cli:
	npx tsc build --project tsconfig.cli.json

run/list: TARGET_DIR=
run/list:
	node dist/cli/index.js list $(TARGET_DIR)

run/init: TARGET_FILE=
run/init:
	node dist/cli/index.js init $(TARGET_FILE)

run/switch: TARGET_FRAMEWORK=
run/switch: TARGET_FILE=
run/switch:
	node dist/cli/index.js switch $(TARGET_FILE) $(TARGET_FRAMEWORK)

run/current: TARGET_FILE=
run/current:
	node dist/cli/index.js current $(TARGET_FILE)

clean:
	-rm -rf dist
