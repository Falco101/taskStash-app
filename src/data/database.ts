import RxDB, { RxDatabase, RxChangeEvent } from "rxdb";
import InitializeTasks, { TaskCollection } from "./tasksCollection";
import InitializeUsers { UsersCollection } from "./usersCollection";
RxDB.plugin(require("pouchdb-adapter-idb"));

type TaskStashDatabaseCollections  = {
  tasks: TaskCollection;
  users: UsersCollection;
};

type TaskStashDatabase = RxDatabase<TaskStashDatabaseCollections>;

export default async () => {  
  const database = await RxDB.create<TaskStashDatabase>({
    name: "taskstashdb",
    adapter: "idb"
  });
  
  await InitializeTasks(database);
}
