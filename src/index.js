const { EAFParser } = require("./eaf-parser");
const { IXTParser } = require("./ixt-parser");
const { TRSParser } = require("./trs-parser");
const { FlextextParser } = require("./flextext-parser");
const convert = require("xml-js");

const parser = {
    eaf: new EAFParser(),
    ixt: new IXTParser(),
    trs: new TRSParser(),
    flextext: new FlextextParser()
};

class Parser {
    /*
     * name: the name of the file: e.g. transcription.eaf
     *
     * data: the content of the file as a utf-8 string
     *
     */
    constructor({ name, data }) {
        this.name = name;
        this.type = name.split(".").pop();
        this.data = data;
    }

    async parse() {
        let data;
        try {
            data = convert.xml2js(this.data);
        } catch (error) {
            throw new Error(`Invalid XML: ${error.message}`);
        }
        if (this.type === "eaf") {
            let result = await parser.eaf.parse({ data });
            return { type: this.type, ...result };
        } else {
            let segments = parser[this.type].parse({ data });
            return { type: this.type, segments };
        }
    }
}

module.exports = {
    Parser
};
