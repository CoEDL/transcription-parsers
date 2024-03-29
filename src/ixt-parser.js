"use strict";

const { flattenDeep } = require("lodash");
const { generateId } = require("./lib.js");

class IXTParser {
    parse({ data }) {
        let header = data.elements[0].elements.filter((e) => e.name === "header")[0];
        let interlinear = data.elements[0].elements.filter((e) => e.name === "interlinear")[0];
        header = {
            source: header.elements.filter((e) => e.attributes.name === "dc:source")[0].attributes
                .value,
            creator: header.elements.filter((e) => e.attributes.name === "dc:creator")[0].attributes
                .value,
            language: header.elements.filter((e) => e.attributes.name === "dc:language")[0]
                .attributes.value,
            date: header.elements.filter((e) => e.attributes.name === "dc:date")[0].attributes
                .value,
        };

        let phrases = interlinear.elements;
        phrases = phrases.map((phrase) => {
            let transcription = phrase.elements.filter((p) => p.name === "transcription")[0];
            let translation = phrase.elements.filter((p) => p.name === "translation")[0];

            transcription = transcription.elements[0].text;
            translation = translation.elements[0].text;
            let wordlist = phrase.elements.filter((p) => p.name === "wordlist")[0];
            let words = wordlist.elements.map((word) => {
                let morphemes = word.elements.filter((w) => w.name === "morphemelist");
                if (morphemes.length) {
                    morphemes = morphemes.map((m) => {
                        return m.elements.map((m) => {
                            return m.elements.map((e) => {
                                return {
                                    type: e.attributes.kind,
                                    text: e.elements[0].text,
                                };
                            });
                        });
                    });
                } else {
                    morphemes = [];
                }
                return {
                    word: word.elements.filter((w) => w.name === "text")[0].elements[0].text,
                    morphemes: flattenDeep(morphemes),
                };
            });
            return {
                time: {
                    begin: phrase.attributes.startTime,
                    end: phrase.attributes.endTime,
                },
                id: generateId(phrase.attributes.id),
                transcription,
                translation,
                words,
            };
        });
        return { phrases, header };
    }
}

module.exports = {
    IXTParser,
};
