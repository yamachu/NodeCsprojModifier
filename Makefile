TARGET_FILE = 
TARGET_DIR = .
TARGET_FRAMEWORK =

init:
	yarn install

build:
	npx tsc

run/list: TARGET_DIR=
run/list:
	node dist/index.js list $(TARGET_DIR)

run/init: TARGET_FILE=
run/init:
	node dist/index.js init $(TARGET_FILE)

run/switch: TARGET_FRAMEWORK=
run/switch: TARGET_FILE=
run/switch:
	node dist/index.js switch $(TARGET_FILE) $(TARGET_FRAMEWORK)

run/current: TARGET_FILE=
run/current:
	node dist/index.js current $(TARGET_FILE)
