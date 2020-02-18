"use strict";

import { map, isArray } from "lodash";

export class IXTParser {
    parse(data) {
        let text = map(data.eopas.interlinear.phrase, d => {
            var words = map(d.wordlist.word, w => {
                try {
                    if (!isArray(w.morphemelist.morpheme)) {
                        w.morphemelist.morpheme = [w.morphemelist.morpheme];
                    }
                } catch (e) {
                    return {};
                }
                var word = map(w.morphemelist.morpheme, function(m) {
                    return {
                        morpheme: m.text[0]["#text"],
                        gloss: m.text[1]["#text"]
                    };
                });
                w = {
                    text: w.text["#text"],
                    words: word
                };
                return w;
            });
            return {
                id: d["@attributes"].startTime ? d["@attributes"].startTime : 0,
                transcription: d.transcription["#text"],
                translation: d.translation["#text"],
                time: {
                    begin: parseFloat(d["@attributes"].startTime)
                },
                words: words
            };
        });
        for (let i = 0; i < text.length - 1; i++) {
            text[i].time.end = text[i + 1].time.begin;
        }
        return text;
    }
}
