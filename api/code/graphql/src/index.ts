import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { createHandler } from "@webiny/handler-aws";
import graphqlPlugins from "@webiny/handler-graphql";
import i18nPlugins from "@webiny/api-i18n/graphql";
import i18nDynamoDbStorageOperations from "@webiny/api-i18n-ddb";
import i18nContentPlugins from "@webiny/api-i18n-content/plugins";
import {
    createPageBuilderGraphQL,
    createPageBuilderContext
} from "@webiny/api-page-builder/graphql";
import { createStorageOperations as createPageBuilderStorageOperations } from "@webiny/api-page-builder-so-ddb";
import pageBuilderPrerenderingPlugins from "@webiny/api-page-builder/prerendering";
import pageBuilderImportExportPlugins from "@webiny/api-page-builder-import-export/graphql";
import { createStorageOperations as createPageBuilderImportExportStorageOperations } from "@webiny/api-page-builder-import-export-so-ddb";
import prerenderingServicePlugins from "@webiny/api-prerendering-service/client";
import dbPlugins from "@webiny/handler-db";
import { DynamoDbDriver } from "@webiny/db-dynamodb";
import dynamoDbPlugins from "@webiny/db-dynamodb/plugins";
import fileManagerPlugins from "@webiny/api-file-manager/plugins";
import fileManagerDynamoDbStorageOperation from "@webiny/api-file-manager-ddb";
import logsPlugins from "@webiny/handler-logs";
import fileManagerS3 from "@webiny/api-file-manager-s3";
import { createFormBuilder } from "@webiny/api-form-builder";
import { createFormBuilderStorageOperations } from "@webiny/api-form-builder-so-ddb";
import {
    createAdminHeadlessCmsGraphQL,
    createAdminHeadlessCmsContext
} from "@webiny/api-headless-cms";
import { createStorageOperations as createHeadlessCmsStorageOperations } from "@webiny/api-headless-cms-ddb";
import headlessCmsModelFieldToGraphQLPlugins from "@webiny/api-headless-cms/content/plugins/graphqlFields";
import securityPlugins from "./security";
import tenantManager from "@webiny/api-tenant-manager";
import { createApwContext, createApwGraphQL } from "@webiny/api-apw";
import { createStorageOperations as createApwSaStorageOperations } from "@webiny/api-apw-scheduler-so-ddb";

// Imports plugins created via scaffolding utilities.
import scaffoldsPlugins from "./plugins/scaffolds";

const debug = process.env.DEBUG === "true";

const documentClient = new DocumentClient({
    convertEmptyValues: true,
    region: process.env.AWS_REGION
});

export const handler = createHandler({
    plugins: [
        dynamoDbPlugins(),
        logsPlugins(),
        graphqlPlugins({ debug }),
        dbPlugins({
            table: process.env.DB_TABLE,
            driver: new DynamoDbDriver({ documentClient })
        }),
        securityPlugins({ documentClient }),
        tenantManager(),
        i18nPlugins(),
        i18nDynamoDbStorageOperations(),
        i18nContentPlugins(),
        fileManagerPlugins(),
        fileManagerDynamoDbStorageOperation(),
        fileManagerS3(),
        prerenderingServicePlugins({
            handlers: {
                render: String(process.env.PRERENDERING_RENDER_HANDLER),
                flush: String(process.env.PRERENDERING_FLUSH_HANDLER),
                queue: {
                    add: String(process.env.PRERENDERING_QUEUE_ADD_HANDLER),
                    process: String(process.env.PRERENDERING_QUEUE_PROCESS_HANDLER)
                }
            }
        }),
        createPageBuilderContext({
            storageOperations: createPageBuilderStorageOperations({
                documentClient
            })
        }),
        createPageBuilderGraphQL(),
        pageBuilderPrerenderingPlugins(),
        pageBuilderImportExportPlugins({
            storageOperations: createPageBuilderImportExportStorageOperations({ documentClient })
        }),
        createFormBuilder({
            storageOperations: createFormBuilderStorageOperations({
                documentClient
            })
        }),
        createAdminHeadlessCmsGraphQL(),
        createAdminHeadlessCmsContext({
            storageOperations: createHeadlessCmsStorageOperations({
                documentClient,
                modelFieldToGraphQLPlugins: headlessCmsModelFieldToGraphQLPlugins()
            })
        }),
        createApwGraphQL(),
        createApwContext({ storageOperations: createApwSaStorageOperations({ documentClient }) }),
        scaffoldsPlugins()
    ],
    http: { debug }
});
