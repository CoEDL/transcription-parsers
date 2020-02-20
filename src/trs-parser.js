"use strict";

const { flattenDeep } = require("lodash");

class TRSParser {
    parse({ data }) {
        data = data.elements.filter(d => d.name === "Trans")[0];
        let transcription = { ...data.attributes };
        let episodes = data.elements.map(episode => {
            let sections = episode.elements.map(section => {
                let turns = section.elements.map(turn => {
                    let elements = [];
                    while (turn.elements.length > 0) {
                        const e1 = turn.elements.shift();
                        const e2 = turn.elements.shift();
                        if (e1.name === "Sync" && e2.name === "Sync") {
                            turn.elements.unshift(e2);
                            if (e1.attributes.time)
                                elements.push({
                                    time: {
                                        begin: e1.attributes.time
                                    },
                                    text: ""
                                });
                        } else {
                            if (e1.attributes.time)
                                elements.push({
                                    time: {
                                        begin: e1.attributes.time
                                    },
                                    text: e2.text
                                });
                        }
                    }
                    return elements;
                });
                turns = flattenDeep(turns);
                for (let i = 0; i < turns.length; i++) {
                    try {
                        turns[i].id = `id_${i}_${turns[i].time.begin}`;
                        turns[i].time.end = turns[i + 1].time.begin;
                    } catch (error) {
                        // do nothing - last turn
                    }
                }
                return { turns };
            });
            return { sections };
        });
        return { ...transcription, episodes };
    }
}

module.exports = {
    TRSParser
};
