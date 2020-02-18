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
     * name: the name of the file: transcription.eaf
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
        if (this.type === "eaf") {
            let data = convert.xml2js(this.data);
            let result = await parser.eaf.parse({ data });
            return { type: this.type, ...result };
        } else {
            let xml = this.parseXML(this.data);
            if (!xml) return [];
            let transcription = this.convertXmlToJson(xml);
            let segments = parser[type].parse(transcription);
            segments = segments.map(segment => {
                return {
                    ...segment,
                    htmlId: `s${this.hash(segment.id)}`
                };
            });
            return { type: this.type, segments };
        }
    }

    parseXML(src) {
        /* returns an XMLDocument, or null if `src` is malformed */
        let key = `a` + Math.random().toString(32);

        let parser = new DOMParser();

        let doc = null;
        try {
            doc = parser.parseFromString(src + `<?${key}?>`, `application/xml`);
        } catch (_) {}

        if (!(doc instanceof XMLDocument)) {
            return null;
        }

        let lastNode = doc.lastChild;
        if (
            !(lastNode instanceof ProcessingInstruction) ||
            lastNode.target !== key ||
            lastNode.data !== ``
        ) {
            return null;
        }

        doc.removeChild(lastNode);

        let errElemCount = doc.documentElement.getElementsByTagName(
            `parsererror`
        ).length;
        if (errElemCount !== 0) {
            let errDoc = null;
            try {
                errDoc = parser.parseFromString(src + `<?`, `application/xml`);
            } catch (_) {}

            if (
                !(errDoc instanceof XMLDocument) ||
                errDoc.documentElement.getElementsByTagName(`parsererror`)
                    .length === errElemCount
            ) {
                return null;
            }
        }

        return doc;
    }

    convertXmlToJson(xml) {
        // http://davidwalsh.name/convert-xml-json
        // Changes XML to JSON
        // Create the return object
        var obj = {};

        if (xml.nodeType === 1) {
            // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] =
                        attribute.nodeValue;
                }
            }
        } else if (xml.nodeType === 3) {
            // text
            obj = xml.nodeValue;
        }

        // do children
        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof obj[nodeName] === "undefined") {
                    obj[nodeName] = this.convertXmlToJson(item);
                } else {
                    if (typeof obj[nodeName].push === "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.convertXmlToJson(item));
                }
            }
        }
        return obj;
    }
}

module.exports = {
    Parser
};
