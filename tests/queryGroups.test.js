import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  classifyQuery,
  groupQueries,
  queryGroupsFromConfig,
} from "../src/utils/queryGroups.js";

describe("classifyQuery", () => {
  it("puts obvious HR titles in hr", () => {
    assert.equal(classifyQuery("HR Manager"), "hr");
    assert.equal(classifyQuery("Talent Acquisition Specialist"), "hr");
    assert.equal(classifyQuery("Python Developer"), "developer");
  });

  it("honors custom HR overrides", () => {
    assert.equal(classifyQuery("People Partner"), "developer");
    assert.equal(classifyQuery("People Partner", { "People Partner": "hr" }), "hr");
  });
});

describe("groupQueries", () => {
  it("splits developer and HR lists", () => {
    const grouped = groupQueries(
      ["Python Developer", "HR Recruiter", "People Partner"],
      { "People Partner": "hr" }
    );
    assert.deepEqual(grouped.developer, ["Python Developer"]);
    assert.deepEqual(grouped.hr, ["HR Recruiter", "People Partner"]);
  });
});

describe("queryGroupsFromConfig", () => {
  it("prefers server query_groups when present", () => {
    const grouped = queryGroupsFromConfig({
      search_queries: ["ignored"],
      query_groups: { developer: ["Go Developer"], hr: ["HR Manager"] },
    });
    assert.deepEqual(grouped.developer, ["Go Developer"]);
    assert.deepEqual(grouped.hr, ["HR Manager"]);
  });
});
