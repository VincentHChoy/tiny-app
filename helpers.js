const bcrypt = require("bcryptjs");

function generateRandomString() {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < 6; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
}


function filterDatabase(user_id,urlDatabase) {
  const output = {};
  for (const ids in urlDatabase) {
    if (urlDatabase[ids].userID === user_id) {
      output[ids] = urlDatabase[ids].longURL;
    }
  }
  return output;
}

function checkLogin(email, password = "", userDatabase) {
  const output = {
    emailExists: false,
    passwordMatches: false,
  };
  for (const ids in userDatabase) {
    if (userDatabase[ids].email === email) {
      output.emailExists = true; // email matches
      output.id = ids;
      const hashedPassword = userDatabase[ids].password;
      if (password.length > 0) {
        if (bcrypt.compareSync(password, hashedPassword)) {
          output.passwordMatches = true;
          return output;
        } else {
          return output;
        }
      }
      return output;
    }
  }
  return output;
}

module.exports = { generateRandomString, filterDatabase, checkLogin };
