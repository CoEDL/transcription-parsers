const { EAFParser } = require("./eaf-parser");
const fs = require("fs");
const path = require("path");

it.skip("should be able to read eaf test file 1 - single tier", async () => {
    let data = await fs.readFileSync(
        path.join(__dirname, "../test-files/single-tier.eaf"),
        "utf-8"
    );

    const parser = new EAFParser();
    let result = await parser.parse({ data });
    expect(result.tiers.name).toBe("tiers");
    expect(result.tiers.children.length).toBe(1);
    expect(result.tiers.children[0].name).toBe("id@unknown");

    expect(result.timeslots.name).toBe("timeslots");
    expect(result.timeslots.children.length).toBe(1);
    expect(result.timeslots.children[0].name).toBe("ts1");
});

it("should be able to read eaf test file 2 - multiple tiers", async () => {
    let data = await fs.readFileSync(
        path.join(__dirname, "../test-files/multiple-tiers.eaf"),
        "utf-8"
    );

    const parser = new EAFParser();
    let result = await parser.parse({ data });
    console.log(JSON.stringify(result.tiers, null, 2));
    expect(result.tiers.children.length).toBe(6);
    expect(result.timeslots.children.length).toBe(1);
});
