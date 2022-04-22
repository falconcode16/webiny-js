import { createElasticsearchClient, createPrefixId } from "../helpers";
import { base as baseIndexConfiguration } from "~/indexConfiguration/base";
import { japanese as japaneseIndexConfiguration } from "~/indexConfiguration/japanese";
import { ElasticsearchQueryBuilderJapaneseOperatorContainsPlugin } from "~/plugins/operator/japanese/contains";
import { ElasticsearchBoolQueryConfig } from "~/types";
import {
    deleteTemplates,
    putTemplate
} from "@webiny/project-utils/testing/elasticsearch/templates";
import { deleteIndexes } from "@webiny/project-utils/testing/elasticsearch/indices";
import { entries, searchTargets } from "./japanese.entries";

describe("Japanese search", () => {
    const client = createElasticsearchClient();

    const prefix = process.env.ELASTIC_SEARCH_INDEX_PREFIX || createPrefixId(10);

    const baseIndexTemplateName = `${prefix}base-index-template`;
    const japaneseIndexTemplateName = `${prefix}japanese-index-template`;
    const indexName = `${prefix}japanese-index-test`;

    const searchPlugin = new ElasticsearchQueryBuilderJapaneseOperatorContainsPlugin();

    const createIndex = async () => {
        try {
            return await client.indices.create({
                index: indexName,
                body: japaneseIndexConfiguration
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
            throw ex;
        }
    };

    const insertAllData = async (items: string[]) => {
        const operations = [];

        for (const index in items) {
            const id = `itemId${index}`;
            const value = items[index];
            operations.push({
                index: {
                    _id: id,
                    _index: indexName
                }
            });
            operations.push({
                id: Number(index) + 1,
                title: value
            });
        }

        return await client.bulk({
            body: operations
        });
    };

    const refreshIndex = async () => {
        return client.indices.refresh({
            index: indexName
        });
    };
    const fetchAllData = async () => {
        return client.search({
            index: indexName,
            body: {}
        });
    };

    const createIndexTemplate = async () => {
        try {
            await putTemplate({
                client,
                template: {
                    name: baseIndexTemplateName,
                    order: 50,
                    body: {
                        index_patterns: ["*-index-*"],
                        aliases: {},
                        ...baseIndexConfiguration
                    }
                }
            });
            await putTemplate({
                client,
                template: {
                    name: japaneseIndexTemplateName,
                    order: 51,
                    body: {
                        index_patterns: ["*japanese-index-*"],
                        aliases: {},
                        ...japaneseIndexConfiguration
                    }
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
            throw ex;
        }
    };

    const prepareWithIndex = async (items: string[]) => {
        await createIndex();
        await insertAllData(items);
        await refreshIndex();
        await fetchAllData();
    };

    const prepareWithTemplate = async (items: string[]) => {
        await createIndexTemplate();
        await insertAllData(items);
        await refreshIndex();
        await fetchAllData();
    };

    beforeEach(async () => {
        await deleteIndexes({ client, indices: [indexName] });
        await deleteTemplates({
            client,
            templates: [baseIndexTemplateName, japaneseIndexTemplateName]
        });
    });

    afterEach(async () => {
        await deleteIndexes({ client, indices: [indexName] });
        await deleteTemplates({
            client,
            templates: [baseIndexTemplateName, japaneseIndexTemplateName]
        });
    });

    it("should verify that all data is prepared", async () => {
        /**
         * first we need to create an index with japanese configuration
         */
        let createIndexResponse;
        try {
            createIndexResponse = await createIndex();
        } catch (ex) {
            throw ex;
        }
        expect(createIndexResponse).toMatchObject({
            body: {
                acknowledged: true
            },
            statusCode: 200
        });
        /**
         * Then insert some data...
         */

        const bulkInsertResponse = await insertAllData(entries);
        expect(bulkInsertResponse).toMatchObject({
            body: {
                errors: false,
                items: entries.map((_, index) => {
                    const id = `itemId${index}`;

                    return {
                        index: {
                            _id: id,
                            _index: indexName,
                            result: "created"
                        }
                    };
                })
            },
            statusCode: 200
        });
        /**
         * We need to wait for the index refresh so we are positive that items are indexed.
         */
        const refreshIndexResponse = await refreshIndex();
        expect(refreshIndexResponse).toMatchObject({
            body: {
                _shards: {
                    total: expect.any(Number),
                    successful: expect.any(Number),
                    failed: 0
                }
            },
            statusCode: 200
        });

        /**
         * Verify that all items are present in the index.
         */
        const fetchAllResponse = await fetchAllData();

        expect(fetchAllResponse).toMatchObject({
            body: {
                hits: {
                    hits: entries.map((title, index) => {
                        const id = `itemId${index}`;

                        return {
                            _id: id,
                            _index: indexName,
                            _source: {
                                id: Number(index) + 1,
                                title
                            }
                        };
                    }),
                    total: {
                        relation: "eq",
                        value: 5
                    }
                }
            },
            statusCode: 200
        });
    });

    it.each(searchTargets)(
        "pre-created index - should get proper search results for - %s",
        async (search, positions) => {
            await prepareWithIndex(entries);

            const query: ElasticsearchBoolQueryConfig = {
                must: [],
                should: [],
                filter: [],
                must_not: []
            };

            searchPlugin.apply(query, {
                basePath: "title",
                path: "title",
                value: search,
                keyword: true
            });

            const response = await client.search({
                index: indexName,
                body: {
                    query: {
                        bool: {
                            ...query
                        }
                    },
                    sort: [
                        {
                            id: {
                                order: "asc"
                            }
                        }
                    ],
                    size: 100,
                    search_after: undefined,
                    track_total_hits: true
                }
            });

            expect(response).toMatchObject({
                body: {
                    hits: {
                        hits: positions.map(index => {
                            const title = entries[index];
                            const id = Number(index) + 1;
                            return {
                                _id: `itemId${index}`,
                                _index: indexName,
                                _source: {
                                    id,
                                    title
                                },
                                _score: null,
                                _type: "_doc",
                                sort: [id]
                            };
                        }),
                        total: {
                            relation: "eq",
                            value: positions.length
                        }
                    }
                },
                statusCode: 200
            });
        }
    );
    it.each(searchTargets)(
        "template index - should get proper search results for - %s",
        async (search, positions) => {
            await prepareWithTemplate(entries);

            const query: ElasticsearchBoolQueryConfig = {
                must: [],
                should: [],
                filter: [],
                must_not: []
            };

            searchPlugin.apply(query, {
                basePath: "title",
                path: "title",
                value: search,
                keyword: false
            });

            const response = await client.search({
                index: indexName,
                body: {
                    query: {
                        bool: {
                            ...query
                        }
                    },
                    sort: [
                        {
                            id: {
                                order: "asc"
                            }
                        }
                    ],
                    size: 100,
                    search_after: undefined,
                    track_total_hits: true
                }
            });

            expect(response).toMatchObject({
                body: {
                    hits: {
                        hits: positions.map(index => {
                            const title = entries[index];
                            const id = Number(index) + 1;
                            return {
                                _id: `itemId${index}`,
                                _index: indexName,
                                _source: {
                                    id,
                                    title
                                },
                                _score: null,
                                _type: "_doc",
                                sort: [id]
                            };
                        }),
                        total: {
                            relation: "eq",
                            value: positions.length
                        }
                    }
                },
                statusCode: 200
            });
        }
    );
});