import { FilterQuery, Model, Types, UpdateQuery } from "mongoose";
import { AbstractDocument } from "./abstract.schema";
import { Logger, NotFoundException } from "@nestjs/common";

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
    protected abstract readonly logger: Logger;

    constructor(protected readonly model: Model<TDocument>) {}

    async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
        this.logger.log(`Creating document in ${this.model.collection.name}`);
        const createdDocument = new this.model(
            {
                ...document,
                _id: new Types.ObjectId(), // Ensure a new ObjectId is generated
            });
        return (await createdDocument.save()).toJSON() as unknown as TDocument;
    }

    async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
        const document = await this.model
        .findOne(filterQuery)
        .lean<TDocument>(true);

        if (!document) {
            this.logger.warn(`Document not found for filter: ${JSON.stringify(filterQuery)}`);
            throw new NotFoundException("Document not found");
        }

        return document;
    }

    async findOneAndUpdate(
        filterQuery: FilterQuery<TDocument>,
        update: UpdateQuery<TDocument>,
    ): Promise<TDocument> {
        const document = await this.model.findOneAndUpdate(filterQuery, update, {
            new: true
        }).lean<TDocument>( true)

        if (!document) {
            this.logger.warn(`Document not found for filter: ${JSON.stringify(filterQuery)}`);
            throw new NotFoundException("Document not found");
        }

        return document;
    }

    async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
        return this.model.find(filterQuery).lean<TDocument[]>(true);
    }

    async findOneandDelete(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
        const document = await this.model.findOneAndDelete(filterQuery).lean<TDocument>(true);

        if (!document) {
            this.logger.warn(`Document not found for filter: ${JSON.stringify(filterQuery)}`);
            throw new NotFoundException("Document not found");
        }

        return document;
    }
}