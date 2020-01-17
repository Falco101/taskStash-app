import RxDB, { RxDatabase, RxCollection, RxJsonSchema, RxDocument } from "rxdb";

type TaskDocType = {
  title: string;
  description: string;
  complete: boolean;
  category: string;
  due: Date | undefined;
  tag: Array<string>;
  priority: 1 | 2 | 3 | 4;
  subTaskIds: Array<string>;
  created: Date;
  createdBy: string;
};

type TaskDocMethods = {};

type TaskDoc = RxDocument<TaskDocType, TaskDocMethods>;

type TaskCollectionMethods = {
  countAllDocuments: () => Promise<number>;
};

type TaskCollection = RxCollection<
  TaskDocType,
  TaskDocMethods,
  TaskCollectionMethods
>;

type TaskDatabaseCollections = {
  tasks: TaskCollection;
};

type TaskDatabase = RxDatabase<TaskDatabaseCollections>;

export async function InitializeDB() {
  const taskDatabase: TaskDatabase = await RxDB.create<TaskDatabaseCollections>(
    {
      name: "UUID-tasks",
      adapter: "memory"
    }
  );

  const taskSchema: RxJsonSchema<TaskDocType> = {
    title: "task schema",
    description: "Describes a task, it's due date and information",
    version: 0,
    keyCompression: true,
    type: "object",
    properties: {
      title: {
        type: "string"
      },
      description: {
        type: "string"
      },
      complete: {
        type: "boolean"
      },
      category: {
        type: "string"
      },
      due: {
        type: "integer"
      },
      tag: {
        type: "array"
      },
      priority: {
        type: "integer"
      },
      subTaskIds: {
        type: "array"
      },
      created: {
        type: "string"
      },
      createdBy: {
        type: "string"
      }
    }
  };
}
