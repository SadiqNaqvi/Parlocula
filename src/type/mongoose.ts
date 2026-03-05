import type { CreateOptions, HydratedDocument, Model, PipelineStage, ClientSession, FilterQuery, SchemaDefinitionProperty, SchemaTypeOptions, SchemaOptions } from "mongoose";
import { Schema, model, models } from "mongoose";

export type MongooseModel<T = any> = Model<T, T, T, T, T, T>;

export interface StrictModel<T> extends Model<T> {
    create(
        docs: Array<T>,
        options: CreateOptions & { aggregateErrors: true }
    ): Promise<(any | Error)[]>;
    create(
        docs: Array<T>,
        options?: CreateOptions
    ): Promise<HydratedDocument<T>[]>;
    create(doc: T): Promise<HydratedDocument<T>>;
    create(...docs: Array<T>): Promise<HydratedDocument<T>[]>;
}

export type PipelineFunc<T = { [key: string]: any }> = (__0: {
    filters: PipelineStage[];
    page: number;
    sort?: any;
    localFieldForLookup?: string,
    replaceRoot?: string,
    limit?: number;
} & T
) => PipelineStage[];

type ExactSchemaDefinition<T> = {
    [K in keyof T]-?: SchemaDefinitionProperty<T[K]> | SchemaTypeOptions<T[K]>;
};

// Our strict Schema class
export class StrictSchema<T> extends Schema<T> {
    constructor(definition: ExactSchemaDefinition<T>, options?: SchemaOptions<any>) {
        super(definition as any, options);
    }
}

export { Schema, model, models }

export type { FilterQuery, PipelineStage, ClientSession }