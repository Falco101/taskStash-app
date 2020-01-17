import { v4 as uuid } from "uuid";
import CryptoJS from "crypto-js";
import Dexie from "dexie";

class UsersDatabase extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  users: Dexie.Table<IDBUser, string>; // string = type of the primkey

  constructor() {
    super("UsersDatabase");
    this.version(1).stores({
      users: "id, email"
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
  email: string;
  salt: string;
  password: string;
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

interface IUser {
  id: string;
  email: string;
  password: string;
}

function genSalt() {
  return CryptoJS.lib.WordArray.random(128 / 8);
}

function hashString(str: string, salt: string) {
  return CryptoJS.PBKDF2(str, salt, {
    keySize: 512 / 32,
    iterations: 10000
  }).toString(CryptoJS.enc.Base64);
}

export default class DBUser implements IDBUser {
  readonly id: string = uuid();
  email: string;
  salt: string = genSalt();
  password: string;

  constructor(email: string, password: string) {
    // at least 8 chars long, at least one uppercase letter, lower case letter, number and special character
    testPassword(password);
    this.email = hashString(email, emailSalt);
    this.password = hashString(password, this.salt);
  }

  changeEmail(newEmail: string, password: string) {
    const pwHash = hashString(password, this.salt);
    // verify the pw before allowing the change email operation
    if (pwHash === this.password) {
      this.email = hashString(newEmail, emailSalt);
      return this.save();
    } else {
      throw new Error("Incorrect password!");
    }
  }

  changePassword(oldPw: string, newPw: string) {
    const oldPwHash = hashString(oldPw, this.salt);
    if (oldPwHash === this.password) {
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

  static async authenticate(email: string, password: string): Promise<IUser> {
    // find email in db, hash and compare pw, either return IUser obj or throw error...
    const mailHash = hashString(email, emailSalt);
    const user = await db.users.get({ email: mailHash });
    if (user) {
      const pwHash = hashString(password, user.salt);
      if (pwHash === user.password) {
        return {
          id: user.id,
          email,
          password
        };
      } else {
        throw new Error("Incorrect Password!");
      }
    } else {
      throw new Error(`No user "${email}" on this device!`);
    }
  }

  static async createUser(email: string, password: string): Promise<IUser> {
    const newUser = new DBUser(email, password);
    await newUser.save();
    return {
      id: newUser.id,
      email,
      password
    };
  }
}
