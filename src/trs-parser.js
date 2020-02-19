"use strict";

const { flattenDeep } = require("lodash");

class TRSParser {
    parse({ data }) {
        data = data.elements.filter(d => d.name === "Trans")[0];
        let episodes = data.elements.map(episode => {
            let sections = episode.elements.map(section => {
                let turns = section.elements.map(turn => {
                    let elements = [];
                    while (turn.elements.length > 0) {
                        const e1 = turn.elements.shift();
                        const e2 = turn.elements.shift();
                        if (e1.name === "Sync" && e2.name === "Sync") {
                            turn.elements.unshift(e2);
                            elements.push({
                                time: e1.attributes.time,
                                text: ""
                            });
                        } else {
                            elements.push({
                                time: e1.attributes.time,
                                text: e2.text
                            });
                        }
                    }
                    return elements;
                });
                return { turns: flattenDeep(turns) };
            });
            return { sections };
        });
        return { episodes };
    }
}

module.exports = {
    TRSParser
};
