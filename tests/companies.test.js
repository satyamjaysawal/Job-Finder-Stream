import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  canonicalizeCompany,
  companiesMatch,
  uniqueCanonicalCompanies,
} from "../src/utils/companies.js";

const KNOWN = ["Accenture", "Amazon", "PwC India", "SAP"];

describe("companiesMatch", () => {
  it("treats LinkedIn variants as the same employer", () => {
    assert.equal(companiesMatch("Accenture in India", ["Accenture"]), true);
    assert.equal(companiesMatch("Amazon Web Services (AWS)", ["Amazon"]), true);
    assert.equal(companiesMatch("PwC Acceleration Center India", ["PwC India"]), true);
  });

  it("does not match unrelated short tokens", () => {
    assert.equal(companiesMatch("Sapphire Solutions", ["SAP"]), false);
    assert.equal(companiesMatch("The EleFit Store", ["The Hartford"]), false);
  });
});

describe("canonicalizeCompany", () => {
  it("maps variants onto the saved shortlist", () => {
    assert.equal(canonicalizeCompany("Accenture in India", KNOWN), "Accenture");
    assert.equal(canonicalizeCompany("Amazon Web Services (AWS)", KNOWN), "Amazon");
    assert.equal(canonicalizeCompany("Zoho", KNOWN), "Zoho");
  });
});

describe("uniqueCanonicalCompanies", () => {
  it("collapses live-scrape duplicate company banners", () => {
    const names = uniqueCanonicalCompanies(
      ["Accenture in India", "Accenture", "Accenture Federal Services", "Amazon Web Services (AWS)", "Amazon"],
      KNOWN
    );
    assert.deepEqual(names, ["Accenture", "Amazon"]);
  });
});
