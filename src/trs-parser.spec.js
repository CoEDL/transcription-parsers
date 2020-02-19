const { Parser } = require("./index");
const fs = require("fs");
const path = require("path");

it("should be able to parse trs test file 1 - single turn", async () => {
    let data = await fs.readFileSync(
        path.join(__dirname, "../test-files/single-turn.trs"),
        "utf-8"
    );

    parser = new Parser({ name: "single-turn.trs", data });
    result = await parser.parse();
    // console.log(JSON.stringify(result.segments, null, 2));
    expect(result.type).toBe("trs");
    expect(result.segments.episodes.length).toBe(1);
    expect(result.segments.episodes[0].sections.length).toBe(1);
    expect(result.segments.episodes[0].sections[0].turns.length).toBe(2);
});

it("should be able to parse trs test file 2 - multiple turns", async () => {
    let data = await fs.readFileSync(
        path.join(__dirname, "../test-files/multiple-turns.trs"),
        "utf-8"
    );

    parser = new Parser({ name: "multiple-turns.trs", data });
    result = await parser.parse();
    // console.log(JSON.stringify(result.segments, null, 2));
    expect(result.type).toBe("trs");
    expect(result.segments.episodes.length).toBe(1);
    expect(result.segments.episodes[0].sections.length).toBe(1);
    expect(result.segments.episodes[0].sections[0].turns.length).toBe(11);
});
