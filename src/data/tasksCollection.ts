import { RxDatabase, RxDocument, RxCollection, RxJsonSchema } from "rxdb";

export type TaskDocType = {
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

export type TaskDocMethods = {};

export type TaskDoc = RxDocument<TaskDocType, TaskDocMethods>;

export type TaskCollectionMethods = {
  countAllDocuments: () => Promise<number>;
};

export type TaskCollection = RxCollection<
  TaskDocType,
  TaskDocMethods,
  TaskCollectionMethods
>;

export type TaskDBCollection = {
  tasks: TaskCollection;
};

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

const taskDocMethods: TaskDocMethods = {};

const taskCollectionMethods: TaskCollectionMethods = {
  countAllDocuments: async function(this: TaskCollection) {
    const allDocs = await this.find().exec();
    return allDocs.length;
  }
};

// async function to configure collection, db is the param
export default async (
  database: RxDatabase<{ tasks: TaskCollection }>
): Promise<void> => {
  await database.collection({
    name: "tasks",
    schema: taskSchema,
    methods: taskDocMethods,
    statics: taskCollectionMethods
  });

  // Hooks can also be set here
  // Example, add a preInsert-hook
  // database.tasks.postInsert(
  //   function myPostInsertHook(
  //     this: TaskCollection, // own collection is bound to the scope
  //     docData, // documents data
  //     doc: TaskDoc // RxDocument
  //   ) {
  //     console.log("insert to " + this.name + "-collection: " + doc.title);
  //   },
  //   false // not async
  // );
};
