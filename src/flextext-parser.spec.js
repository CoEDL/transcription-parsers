const { Parser } = require("./index");
const fs = require("fs");
const path = require("path");

it("should be able to parse flextext test file 1 - single paragraph", async () => {
    let data = await fs.readFileSync(
        path.join(__dirname, "../test-files/single-paragraph.flextext"),
        "utf-8"
    );

    parser = new Parser({ name: "single-paragraph.flextext", data });
    result = await parser.parse();
    expect(result.type).toBe("flextext");
    expect(result.segments.length).toBe(1);
    expect(result.segments[0].phrases.length).toBe(1);
    expect(result.segments[0].phrases[0].items.length).toBe(2);
    expect(result.segments[0].phrases[0].words.length).toBe(5);
});

it("should be able to parse flextext test file 2 - multiple paragraphs", async () => {
    let data = await fs.readFileSync(
        path.join(__dirname, "../test-files/multiple-paragraphs.flextext"),
        "utf-8"
    );

    parser = new Parser({ name: "single-paragraph.flextext", data });
    result = await parser.parse();
    expect(result.type).toBe("flextext");
    expect(result.segments.length).toBe(6);
});
