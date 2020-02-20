const { Parser } = require("./index");
const fs = require("fs");
const path = require("path");

it("should be able to parse ixt test file 1 - single phrase", async () => {
    let data = await fs.readFileSync(
        path.join(__dirname, "../test-files/single-phrase.ixt"),
        "utf-8"
    );

    parser = new Parser({ name: "single-phrase.ixt", data });
    result = await parser.parse();
    expect(result.segments.phrases.length).toBe(1);
});

it("should be able to parse ixt test file 2 - multiple phrases", async () => {
    let data = await fs.readFileSync(
        path.join(__dirname, "../test-files/multiple-phrases.ixt"),
        "utf-8"
    );

    parser = new Parser({ name: "multiple-phrases.ixt", data });
    result = await parser.parse();
    expect(result.segments.phrases.length).toBe(3);
});
