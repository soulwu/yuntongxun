PATH := ./node_modules/.bin:${PATH}

.PHONY : init clean build dist publish

dist: clean init build

init:
	npm install

build:
	coffee -o lib/ -c src/

publish: dist
	npm publish

clean:
	rm -rf lib/