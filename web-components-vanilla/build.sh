#!/bin/bash

rm -rf dist/
mkdir dist
cp -r index.css assets dist/
cp index.html dist/tmp.html
cat *.js **/*.js > dist/bundle.js
minify dist/bundle.js > dist/bundle.min.js
cat dist/tmp.html | sed "/script src/d" | sed 's/<!-- BEGIN-SCRIPTS-->/<script src="bundle.min.js"><\/script>/' \
	> dist/index.html
