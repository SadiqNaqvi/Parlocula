import {
  ConnectionModelType,
  FrameModelType,
  LinkModelType,
} from "@type/models";
import { ApplySchemaOptions, FlatRecord, Schema, SchemaDefinitionProperty, SchemaOptions, SchemaTypeOptions } from "mongoose";

export const linkModel = new Schema<LinkModelType>({
  label: {
    type: String,
    required: [true, "Label for a Link is required."],
  },
  path: {
    type: String,
    required: [true, "Path for a Link is required"],
  },
});

export const connectionModel = new Schema<ConnectionModelType>({
  type: {
    type: String,
    enum: ["person", "movie", "show"],
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

export const frameModel = new Schema<FrameModelType>({
  path: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["image", "video"],
    required: true,
  },
  isExternal: Boolean,
});

type ExactSchemaDefinition<T> = {
  [K in keyof T]-?: SchemaDefinitionProperty<T[K]> | SchemaTypeOptions<T[K]>;
};

// Our strict Schema class
export class StrictSchema<T> extends Schema<T> {
  constructor(definition: ExactSchemaDefinition<T>, options?: SchemaOptions<any>) {
    super(definition as any, options);
  }
}
