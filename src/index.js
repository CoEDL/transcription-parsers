import { EAFParser } from "./eaf-parser";
import { IXTParser } from "./ixt-parser";
import { TRSParser } from "./trs-parser";
import { FlextextParser } from "./flextext-parser";

const parser = {
    eaf: new EAFParser(),
    ixt: new IXTParser(),
    trs: new TRSParser(),
    flextext: new FlextextParser()
};

class Parser {
    constructor() {}
    async loadTranscription({ transcription }) {
        const type = transcription.name.split(".").pop();
        let response = await fetch(transcription.path);
        if (!response.ok) throw response;
        let xml = await response.text();
        let segments, tiers;
        if (type === "eaf") {
            let result = await parser.eaf.extract({ data: xml });
            segments = result.segments;
            tiers = result.tiers;
        } else {
            xml = this.parseXML(xml);
            if (!xml) return [];
            transcription = this.convertXmlToJson(xml);
            segments = parser[type].parse(transcription);
            segments = segments.map(segment => {
                return {
                    ...segment,
                    htmlId: `s${this.hash(segment.id)}`
                };
            });
        }
        return { type, segments, tiers };
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
