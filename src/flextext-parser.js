"use strict";

const { map, isArray } = require("lodash");

class FlextextParser {
    constructor() {}

    parse({ data }) {
        let paragraphs = data.elements[0].elements[0].elements[0].elements;
        paragraphs = paragraphs.map(paragraph => {
            let phrases = paragraph.elements[0].elements;
            phrases = phrases.map(phrase => {
                let items = phrase.elements.filter(e => e.name === "item");
                let words = phrase.elements.filter(e => e.name === "words")[0]
                    .elements;
                items = items.map(item => {
                    return {
                        lang: item.attributes.lang,
                        type: item.attributes.type,
                        text: item.elements[0].text
                    };
                });

                words = words.map(word => {
                    let morphemes = word.elements.filter(
                        e => e.name === "morphemes"
                    );
                    if (!morphemes.length) return { morphemes: [] };
                    if (!morphemes[0].elements) return { morphemes: [] };

                    morphemes = morphemes.map(morph => {
                        return morph.elements.map(e => {
                            return e.elements.map(f => {
                                return {
                                    lang: getAttribute(f, "lang"),
                                    type: getAttribute(f, "type"),
                                    text: f.elements[0].text
                                };
                            });
                        });
                    });
                    return { morphemes };
                });

                phrase = {
                    id: phrase.attributes["begin-time-offset"],
                    ...phrase.attributes,
                    time: {
                        begin: phrase.attributes["begin-time-offset"],
                        end: phrase.attributes["end-time-offset"]
                    },
                    items,
                    words
                };
                return phrase;
            });
            return { phrases };
        });
        return paragraphs;
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
    FlextextParser
};
