const { Parser } = require("./index");
const fs = require("fs");
const path = require("path");

it("should be able to parse eaf test file 1 - single tier", async () => {
    let data = await fs.readFileSync(
        path.join(__dirname, "../test-files/single-tier.eaf"),
        "utf-8"
    );

    parser = new Parser({ name: "single-tier.eaf", data });
    result = await parser.parse();
    expect(result.tiers.name).toBe("tiers");
    expect(result.tiers.children.length).toBe(1);
    expect(result.tiers.children[0].name).toBe("id@unknown");
    expect(result.timeslots.name).toBe("timeslots");
    expect(result.timeslots.children.length).toBe(2);
    expect(result.timeslots.children[0].name).toBe("ts1");
});

it("should be able to parse eaf test file 2 - multiple tiers", async () => {
    let data = await fs.readFileSync(
        path.join(__dirname, "../test-files/multiple-tiers.eaf"),
        "utf-8"
    );

    parser = new Parser({ name: "single-tier.eaf", data });
    result = await parser.parse();
    expect(result.tiers.children.length).toBe(6);
    expect(result.timeslots.children.length).toBe(2);
});
