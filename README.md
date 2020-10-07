# Transcription Parsers

- [Transcription Parsers](#transcription-parsers)
  - [Installation](#installation)
  - [Browser Usage](#browser-usage)
  - [NodeJS Usage](#nodejs-usage)

This is a library for working with linguistic transcriptions. It currently works with `eaf`, `ixt`, `trs` and `flextext`
formats.

It has been designed to work in both browser and node environments. Accordingly, you need to load the file content and
pass it to the library. Following are usage examples for both types of environments.

## Installation

npm install --save @coedl/transcription-parsers

## Browser Usage

Assuming you've loaded the file content over http/s with something like:

````
const transcriptionPath = `http://{url}/{to}/{transcription.file}
let response = await fetch(transcriptionPath);
if (!response.ok) throw response;
let xmlString = await response.text();```
````

`xml` will be the string content that you can then pass to the library viz:

```
const { Parser } = require("transcription-parser");
let parser = new Parser({
    name: "{name of file.ext}",
    data: xmlString
});
let result = await parser.parse()
```

## NodeJS Usage

Assuming you've loaded the file content with something like:

```
let xmlString = await fs.readFileSync(
    path.join(__dirname, "{path}/{to}/{file}"),
    "utf-8"
);

```

`xml` will be the string content that you can then pass to the library viz:

```
const { Parser } = require("transcription-parser");
let parser = new Parser({
    name: "{name of file.ext}",
    data: xmlString
});
let result = await parser.parse()
```
