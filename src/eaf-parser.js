"use strict";

const { flattenDeep, groupBy, orderBy, round, difference, isEmpty } = require("lodash");
const { generateId } = require("./lib.js");

class EAFParser {
    constructor() {}

    async parse({ data }) {
        this.data = data;

        let tiers = [];
        let statistics = {};
        let timeslots = this.extractTimeSlots();
        if (!timeslots) {
            throw new Error("No timeslots found in file");
        }
        let errors = [];
        let annotations = [];
        if (timeslots.length) {
            let { alignableAnnotations, referenceAnnotations } = this.extractAnnotations();
            try {
                tiers = this.joinAnnotationsToTiers({
                    alignableAnnotations,
                    referenceAnnotations,
                });
            } catch (error) {
                throw new Error(`File invalid: unable to join 'ANNOTATIONS' to TIERS`);
            }
            try {
                annotations = this.joinAnnotations({
                    alignableAnnotations: [...alignableAnnotations],
                    referenceAnnotations: [...referenceAnnotations],
                });
            } catch (error) {
                throw new Error(
                    `File invalid: unable to join 'ALIGNABLE_ANNOTATIONS' to 'REFERENCE_ANNOTATIONS'`
                );
            }
            let timeslotsKeyedByName = groupBy(timeslots, "name");
            annotations = annotations.map((a) => {
                a.id = generateId(a.name);
                a.time = {
                    begin: timeslotsKeyedByName[a.ts.start][0].value / 1000,
                    end: timeslotsKeyedByName[a.ts.end][0].value / 1000,
                };
                return a;
            });
            try {
                timeslots = this.joinAnnotationsToTimeslots({
                    annotations,
                    timeslots,
                });
            } catch (error) {
                throw new Error(`File invalid: unable to join annotations to TIERS`);
            }
            statistics = this.gatherStatistics({
                timeslots,
                tiers,
                annotations,
                alignableAnnotations,
                referenceAnnotations,
            });
        } else {
            errors.push({ msg: "No timeslots found" });
        }

        return {
            tiers: {
                name: "tiers",
                children: tiers,
            },
            timeslots: {
                name: "timeslots",
                children: timeslots.filter((t) => t.children),
            },
            statistics: {
                ...statistics,
            },
            errors,
        };
    }

    extractTimeSlots() {
        let timeslots = this.data.elements[0].elements.filter((e) => e.name === "TIME_ORDER");

        if (timeslots.length && timeslots[0].elements) {
            timeslots = timeslots[0].elements;
            timeslots = timeslots.map((timeslot) => {
                return {
                    name: timeslot.attributes.TIME_SLOT_ID,
                    value: parseInt(timeslot.attributes.TIME_VALUE),
                };
            });
            return timeslots;
        }
        return undefined;
    }

    extractAnnotations() {
        const tiers = this.data.elements[0].elements.filter((e) => e.name === "TIER");
        let annotations = this.data.elements[0].elements
            .filter((e) => e.name === "TIER")
            .map((t) => {
                if (t.elements) {
                    return t.elements.map((a) => {
                        return { ...a, tier: t.attributes.TIER_ID };
                    });
                } else {
                    return [];
                }
            });

        annotations = flattenDeep(annotations);
        let alignableAnnotations = annotations.filter((a) => {
            return a.elements[0].name === "ALIGNABLE_ANNOTATION";
        });
        let referenceAnnotations = annotations.filter((a) => {
            return a.elements[0].name === "REF_ANNOTATION";
        });

        alignableAnnotations = alignableAnnotations.map((annotation) => {
            try {
                return {
                    name: annotation.elements[0].attributes.ANNOTATION_ID,
                    type: "ALIGNABLE_ANNOTATION",
                    value: annotation.elements[0].elements[0].elements
                        ? annotation.elements[0].elements[0].elements[0].text
                        : undefined,
                    tier: annotation.tier,
                    children: [],
                    ts: {
                        start: annotation.elements[0].attributes.TIME_SLOT_REF1,
                        end: annotation.elements[0].attributes.TIME_SLOT_REF2,
                    },
                    time: {
                        start: "",
                        end: "",
                    },
                };
            } catch (error) {
                console.log(JSON.stringify(annotation, null, 2));
            }
        });
        referenceAnnotations = referenceAnnotations.map((annotation) => {
            return {
                name: annotation.elements[0].attributes.ANNOTATION_ID,
                parent: annotation.elements[0].attributes.ANNOTATION_REF,
                type: "REF_ANNOTATION",
                value: annotation.elements[0].elements[0].elements
                    ? annotation.elements[0].elements[0].elements[0].text
                    : undefined,
                tier: annotation.tier,
                children: [],
            };
        });
        return {
            alignableAnnotations: alignableAnnotations,
            referenceAnnotations: referenceAnnotations,
        };
    }

    joinAnnotations({ alignableAnnotations, referenceAnnotations }) {
        referenceAnnotations.forEach((annotation) => {
            join(annotation, alignableAnnotations);
        });
        return alignableAnnotations;

        function join(annotation, annotations) {
            for (let a of annotations) {
                if (annotation.parent === a.name) {
                    a.children.push(annotation);
                    break;
                } else {
                    join(annotation, a.children);
                }
            }
        }
    }

    joinAnnotationsToTimeslots({ annotations, timeslots }) {
        for (let annotation of annotations) {
            for (let timeslot of timeslots) {
                if (annotation.ts.start === timeslot.name) timeslot.children = [{ ...annotation }];
                // if (annotation.ts.end === timeslot.name)
                //     timeslot.children = [{ ...annotation }];
            }
        }
        return timeslots;
    }

    joinAnnotationsToTiers({ alignableAnnotations, referenceAnnotations }) {
        let groupedByTier = groupBy([...alignableAnnotations, ...referenceAnnotations], "tier");
        let tiers = [];
        for (let tier of Object.keys(groupedByTier)) {
            tiers.push({
                name: tier,
                value: "",
                children: groupedByTier[tier],
            });
        }
        return tiers;
    }

    gatherStatistics({
        timeslots,
        tiers,
        annotations,
        alignableAnnotations,
        referenceAnnotations,
    }) {
        let statistics = {};
        let ts = orderBy([...timeslots], "value");
        statistics.duration = ts.slice(-1)[0].value - ts[0].value;
        statistics.numberOfTimeslots = timeslots.length;
        statistics.startTime = ts[0].value;
        statistics.endTime = ts.slice(-1)[0].value;
        statistics.numberOfTiers = tiers.length;
        statistics.coveredByAnnotations = round(
            (statistics.duration / statistics.endTime) * 100,
            1
        );
        statistics.emptyTiers = false;
        for (let tier of tiers) {
            if (!tier.children.length) statistics.emptyTiers = true;
        }

        let mappedAnnotations = {};
        let i = 0;
        for (let annotation of annotations) {
            count(annotation);
        }
        mappedAnnotations = Object.keys(mappedAnnotations);
        let dataAnnotations = [
            ...alignableAnnotations.map((a) => a.name),
            ...referenceAnnotations.map((a) => a.name),
        ];
        statistics.unmappedAnnotations = difference(dataAnnotations, mappedAnnotations);
        statistics.referenceAnnotations = referenceAnnotations.length;
        statistics.alignableAnnotations = alignableAnnotations.length;
        statistics.annotationsWithContent = {
            count: 0,
            percentage: 0,
        };
        alignableAnnotations.forEach((a) => {
            if (!isEmpty(a.value)) statistics.annotationsWithContent.count += 1;
        });
        statistics.annotationsWithContent.percentage = round(
            (statistics.annotationsWithContent.count / statistics.alignableAnnotations) * 100,
            1
        );

        function count(annotation) {
            mappedAnnotations[annotation.name] = annotation;
            i += 1;
            for (let child of annotation.children) {
                count(child);
            }
        }
        return statistics;
    }
}

module.exports = {
    EAFParser,
};
