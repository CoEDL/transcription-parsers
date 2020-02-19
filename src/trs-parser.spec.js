const { Parser } = require("./index");
const fs = require("fs");
const path = require("path");

it.only("should be able to parse trs test file 1 - single paragraph", async () => {
    let data = await fs.readFileSync(
        path.join(__dirname, "../test-files/NT1-98007-98007.trs"),
        "utf-8"
    );

    parser = new Parser({ name: "NT1-98007-98007.trs", data });
    result = await parser.parse();
    // console.log(JSON.stringify(result.segments, null, 2));
    expect(result.type).toBe("trs");
    expect(result.segments.episodes.length).toBe(1);
    expect(result.segments.episodes[0].sections.length).toBe(1);
    expect(result.segments.episodes[0].sections[0].turns.length).toBe(277);
});
