const { Parser } = require("./index");
const fs = require("fs");
const path = require("path");

it("should throw an error on bad xml file", async () => {
    let data = await fs.readFileSync(
        path.join(__dirname, "../test-files/bad-xml.trs"),
        "utf-8"
    );

    parser = new Parser({ name: "bad-xml.trs", data });
    try {
        await parser.parse();
    } catch (error) {
        expect(error.message).toBeDefined();
    }
});
