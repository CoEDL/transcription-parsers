"use strict";

import {
    map,
    groupBy,
    isArray,
    each,
    without,
    isObject,
    zip,
    flatten
} from "lodash";

export class TRSParser {
    parse(data) {
        if (data.html) {
            return;
        }
        if (data.parsererror && data.parsererror["#text"].match(/Error/)) {
            return;
        }

        var speakers;
        if (data.Trans[1].Speakers) {
            speakers = map(data.Trans[1].Speakers.Speaker, function(d) {
                return {
                    id: d["@attributes"].id,
                    name: d["@attributes"].name
                };
            });
            speakers = groupBy(speakers, function(d) {
                return d.id;
            });
        } else {
            speakers = {};
        }

        var turns = [];
        if (!isArray(data.Trans[1].Episode.Section.Turn)) {
            data.Trans[1].Episode.Section.Turn = [
                data.Trans[1].Episode.Section.Turn
            ];
        }

        each(data.Trans[1].Episode.Section.Turn, function(d) {
            var spkr;
            if (d["@attributes"]) {
                spkr = d["@attributes"].speaker;
            } else {
                spkr = "";
            }

            var texts = map(d["#text"], function(e) {
                return e.trim();
            });
            texts = without(texts, "");

            var syncs;
            if (isArray(d.Sync)) {
                syncs = map(d.Sync, function(e) {
                    return e["@attributes"].time;
                });
            } else if (isObject(d.Sync)) {
                syncs = [d.Sync["@attributes"].time];
            }
            var transdata = zip(syncs, texts);

            transdata = map(transdata, function(d) {
                return {
                    id: d[0] ? d[0] : 0,
                    time: {
                        begin: d[0] ? d[0] : 0
                    },
                    value: d[1],
                    referenceValue: "",
                    speaker: spkr
                };
            });
            turns.push(transdata);
        });
        data = groupBy(flatten(turns), function(d) {
            return d.id;
        });

        data = map(data, function(d) {
            return d[0];
        });

        return data;
    }
}
