import { v4 as uuid } from "uuid";
import CryptoJS, { WordArray } from "crypto-js";
import Dexie from "dexie";

class UsersDatabase extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  users: Dexie.Table<IDBUser, string>; // string = type of the primkey

  constructor() {
    super("UsersDatabase");
    this.version(1).stores({
      users: "id, emailHash"
    });
    // The following line is needed if your typescript
    // is compiled using babel instead of tsc:
    this.users = this.table("users");
    this.users.mapToClass(DBUser);
  }
}

const db = new UsersDatabase();

interface IDBUser {
  id: string;
  email: WordArray;
  salt: string;
  password: WordArray;
}

// Use fixed salt so we can query the user from the db
const emailSalt = "96e80bbb38aec9b56bd9558c3f583f36";

export function testPassword(password: string) {
  if (
    new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
    ).test(password)
  ) {
    return true;
  } else {
    throw new Error(
      "Password must contain at least one uppercase letter, lower case letter, number and special character!"
    );
  }
}

class DBUser implements IDBUser {
  readonly id: string = uuid();
  email: WordArray;
  salt: string = genSalt();
  password: WordArray;

  constructor(email: string, password: string) {
    // at least 8 chars long, at least one uppercase letter, lower case letter, number and special character
    testPassword(password);
    this.email = hashString(email, emailSalt);
    this.password = hashString(password, this.salt);
  }

  changeEmail(newEmail: string, password: string) {
    const pwHash = hashString(password, this.salt);
    // verify the pw before allowing the change email operation
    if (pwHash.toString() === this.password.toString()) {
      this.email = hashString(newEmail, emailSalt);
      return this.save();
    } else {
      throw new Error("Incorrect password!");
    }
  }

  changePassword(oldPw: string, newPw: string) {
    const oldPwHash = hashString(oldPw, this.salt);
    if (oldPwHash.toString() === this.password.toString()) {
      testPassword(newPw);
      // new salt, don't re-use existing salt
      this.salt = genSalt();
      this.password = hashString(newPw, this.salt);
      return this.save();
    } else {
      throw new Error("Incorrect password!");
    }
  }

  save() {
    return db.transaction("rw", db.users, async () => {
      await db.users.put(this);
    });
  }

  static authenticate(email: string, password: string) {
    const mailHash = hashString(email, emailSalt);
    // find email in db, hash and compare pw, either return IUser obj or throw error...
  }
}

interface IUser {
  id: string;
  email: string;
  password: string;
}

function genSalt() {
  return CryptoJS.lib.WordArray.random(128 / 8);
}

function hashString(str: string, salt: string) {
  return CryptoJS.SHA256(salt + str);
}

export function createUser(email: string, password: string): IUser {
  const newUser = new DBUser(email, password);
  newUser.save();
  return {
    id: newUser.id,
    email,
    password
  };
}

export default function(email: string, password: string) {}
