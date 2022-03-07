declare namespace NodeJS {
    export interface ProcessEnv {
        NODE_ENV?: "test" | "prod" | "dev" | string;
        DB_TABLE?: string;
        DB_TABLE_TENANCY?: string;
        DB_TABLE_PRERENDERING_SERVICE?: string;
        DB_TABLE_ELASTICSEARCH?: string;
        DB_TABLE_ADMIN_USERS?: string;
        DB_TABLE_FILE_MANGER?: string;
        DB_TABLE_HEADLESS_CMS?: string;
        DB_PAGE_BUILDER?: string;
        DB_TABLE_PAGE_BUILDER?: string;
        ELASTICSEARCH_SHARED_INDEXES?: "true" | "false" | string;
        WEBINY_VERSION?: string;
        WEBINY_ENABLE_VERSION_HEADER?: "true" | "false" | string;
        WEBINY_LOGS_FORWARD_URL?: string;
        AWS_LAMBDA_FUNCTION_NAME?: string;
        PATH?: string;
        DEBUG?: "true" | "false" | string;
        PULUMI_HOME?: string;
        PULUMI_SKIP_UPDATE_CHECK?: "true" | "false" | string;
        MOCK_DYNAMODB_ENDPOINT?: string;
        ELASTICSEARCH_PORT?: string;
        WEBINY_ENV?: string;
        REACT_APP_DEBUG?: "true" | "false" | string;
        AWS_REGION?: string;
        WEBINY_MULTI_TENANCY?: string;
        REACT_APP_WEBINY_VERSION?: string;
        REACT_APP_GRAPHQL_API_URL?: string;
        REACT_APP_API_URL?: string;
        REACT_APP_WEBINY_MULTI_TENANCY?: "true" | "false" | string;
        REACT_APP_USER_POOL_REGION?: string;
        REACT_APP_USER_POOL_ID?: string;
        REACT_APP_USER_POOL_WEB_CLIENT_ID?: string;
        REACT_APP_USER_POOL_PASSWORD_POLICY?: string;
        REACT_APP_ADMIN_USER_CAN_CHANGE_EMAIL?: string;
        COGNITO_USER_POOL_ID?: string;
        COGNITO_REGION?: string;
        IMAGE_TRANSFORMER_FUNCTION?: string;
        S3_BUCKET?: string;
        ELASTIC_SEARCH_INDEX_PREFIX?: string;
        EXPORT_PAGES_PROCESS_HANDLER?: string;
        IMPORT_PAGES_CREATE_HANDLER?: string;
    }
}