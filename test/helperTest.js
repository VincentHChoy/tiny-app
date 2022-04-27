const { assert,expect } = require("chai");
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
  isdfD3: {
    longURL: "https://www.kfc.ca",
    userID: "user2RandomID",
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

describe("Filterdatabase", function () {
  it("return a key-value datastructure with the shortURL:longURL belonging to the user", function () {
    const filteredDatabase = filterDatabase("aJ48lW", testUrlDatabase);
    const expected = {
      sqq3y6: "https://www.tsn.ca",
      i3BoGr: "https://www.google.ca",
    };
    expect(filteredDatabase).to.deep.equal(expected);
  });
});

