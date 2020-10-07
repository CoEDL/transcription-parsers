"use strict";

const { flattenDeep } = require("lodash");

class FlextextParser {
    constructor() {}

    parse({ data }) {
        let paragraphs = data.elements[0].elements[0].elements[0].elements;
        paragraphs = paragraphs.map((paragraph) => {
            let phrases = paragraph.elements
                ? paragraph.elements[0].elements
                : [];
            phrases = phrases.map((phrase) => {
                let items = phrase.elements.filter((e) => e.name === "item");
                let words = phrase.elements.filter((e) => e.name === "words")[0]
                    .elements;
                items = items.map((item) => {
                    return {
                        lang: item.attributes.lang,
                        type: item.attributes.type,
                        text: item.elements ? item.elements[0].text : "",
                    };
                });
                let transcription = items.filter((i) => i.type !== "text")[0];
                let translation = items.filter((i) => i.type === "gls")[0];

                if (words) {
                    words = words.map((word) => {
                        let morphemes = word.elements.filter(
                            (e) => e.name === "morphemes"
                        );
                        if (!morphemes.length) return { morphemes: [] };
                        if (!morphemes[0].elements) return { morphemes: [] };

                        morphemes = morphemes.map((morph) => {
                            return morph.elements.map((e) => {
                                return e.elements.map((f) => {
                                    return {
                                        lang: getAttribute(f, "lang"),
                                        type: getAttribute(f, "type"),
                                        text: f.elements[0].text,
                                    };
                                });
                            });
                        });
                        return { morphemes: flattenDeep(morphemes) };
                    });
                } else {
                    words = [];
                }

                phrase = {
                    id: `id_${phrase.attributes["begin-time-offset"]}`,
                    ...phrase.attributes,
                    time: {
                        begin:
                            parseInt(phrase.attributes["begin-time-offset"]) /
                            1000,
                        end:
                            parseInt(phrase.attributes["end-time-offset"]) /
                            1000,
                    },
                    transcription,
                    translation,
                    words,
                };
                return phrase;
            });
            return { phrases };
        });
        return { paragraphs };
    }
}

function getAttribute(e, attr) {
    try {
        return e.attributes[attr];
    } catch (error) {
        return "";
    }
}

module.exports = {
    FlextextParser,
};
