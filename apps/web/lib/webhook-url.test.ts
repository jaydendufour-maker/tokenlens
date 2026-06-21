import assert from "node:assert/strict";
import test from "node:test";
import { isPublicAddress, webhookUrlSyntaxError } from "./webhook-url.ts";

test("blocks internal and metadata destinations", () => {
  for (const address of ["127.0.0.1", "10.0.0.1", "169.254.169.254", "::1", "fd00::1"]) {
    assert.equal(isPublicAddress(address), false, address);
  }
  assert.match(webhookUrlSyntaxError("http://example.com/hook") ?? "", /HTTPS/);
  assert.notEqual(webhookUrlSyntaxError("https://127.0.0.1/hook"), null);
  assert.notEqual(webhookUrlSyntaxError("https://localhost/hook"), null);
});

test("allows a normal public HTTPS webhook syntax", () => {
  assert.equal(webhookUrlSyntaxError("https://hooks.example.com/tokenlens"), null);
  assert.equal(isPublicAddress("8.8.8.8"), true);
  assert.equal(isPublicAddress("2606:4700:4700::1111"), true);
});
