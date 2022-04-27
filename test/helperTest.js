const { assert } = require("chai");
const { filterDatabase, checkLogin } = require("../helpers.js");

const testUrlDatabase = {
  sqq3y6: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const testUsers = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "dog",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function () {
  it("should return a user with valid email if it exists", function () {
    const user = checkLogin("user@example.com", "", testUsers);
    const expectedUserID = "aJ48lW";
    assert.equal(expectedUserID, user.id);
  });
  it("should return undefined if email does not exist", () => {
    const user = checkLogin("dog@example.com", "", testUsers);
    const expectedUserID = undefined;
    assert.equal(expectedUserID, user.id);
  });
});
