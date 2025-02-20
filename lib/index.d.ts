import { Context, Schema } from 'koishi';
export declare const name = "deepseek-ai";
export declare const usage = "deepseek\u7684api\u9002\u914D\u63D2\u4EF6\uFF0C\u53EF\u4EE5\u8C03\u7528\u5B98\u65B9\u7684api\u6765\u63A5\u5165koishi\u3002\u63D2\u4EF6\u672C\u8EAB\u7528deepseek\u5F00\u53D1\uFF0C\u6240\u4EE5\u91CC\u9762\u7684\u4EE3\u7801\u5176\u5B9E\u8FD8\u7559\u6709\u5F88\u591A\u5907\u6CE8\u3002\u672C\u4EBA\u5E76\u4E0D\u662F\u4E13\u4E1A\u5F00\u53D1\u8005\uFF0C\u6240\u4EE5\u540E\u7EED\u53EF\u80FD\u5F88\u96BE\u6709\u66F4\u65B0\uFF0C\u4E0D\u8FC7\u4E5F\u53EF\u4EE5\u5173\u6CE8\u4E5F\u8BB8\uFF0C\u4E5F\u8BB8\u4EE5\u540E\u8FD8\u80FD\u5F00\u53D1\u51FA\u66F4\u591A\u529F\u80FD\uFF1F\uFF08\u7B11\uFF09apikey\u8BF7\u81EA\u884C\u5230\u5B98\u7F51 https://www.deepseek.com/ \u521B\u5EFA\u83B7\u53D6\uFF0C\u672C\u63D2\u4EF6\u5E76\u4E0D\u63D0\u4F9B\u3002";
export interface Config {
    apiKey: string;
    apiEndpoint: string;
    defaultModelIndex: number;
    presets: Preset[];
    defaultPresetIndex: number;
    enableReasoner: boolean;
    timeout: number;
    waitingMessage: string;
    requestLimit: number;
    maxHistory: number;
    apiErrorText: string;
    creativity: number;
    openness: number;
    divergence: number;
    vocabulary: number;
}
interface Preset {
    name: string;
    content: string;
}
export declare const Config: Schema<Schemastery.ObjectS<{
    apiKey: Schema<string, string>;
    apiEndpoint: Schema<string, string>;
    defaultModelIndex: Schema<number, number>;
    presets: Schema<Schemastery.ObjectS<{
        name: Schema<string, string>;
        content: Schema<string, string>;
    }>[], Schemastery.ObjectT<{
        name: Schema<string, string>;
        content: Schema<string, string>;
    }>[]>;
    defaultPresetIndex: Schema<number, number>;
    enableReasoner: Schema<boolean, boolean>;
    timeout: Schema<number, number>;
    waitingMessage: Schema<string, string>;
    requestLimit: Schema<number, number>;
    maxHistory: Schema<number, number>;
    apiErrorText: Schema<string, string>;
    creativity: Schema<number, number>;
    openness: Schema<number, number>;
    divergence: Schema<number, number>;
    vocabulary: Schema<number, number>;
}>, Schemastery.ObjectT<{
    apiKey: Schema<string, string>;
    apiEndpoint: Schema<string, string>;
    defaultModelIndex: Schema<number, number>;
    presets: Schema<Schemastery.ObjectS<{
        name: Schema<string, string>;
        content: Schema<string, string>;
    }>[], Schemastery.ObjectT<{
        name: Schema<string, string>;
        content: Schema<string, string>;
    }>[]>;
    defaultPresetIndex: Schema<number, number>;
    enableReasoner: Schema<boolean, boolean>;
    timeout: Schema<number, number>;
    waitingMessage: Schema<string, string>;
    requestLimit: Schema<number, number>;
    maxHistory: Schema<number, number>;
    apiErrorText: Schema<string, string>;
    creativity: Schema<number, number>;
    openness: Schema<number, number>;
    divergence: Schema<number, number>;
    vocabulary: Schema<number, number>;
}>>;
export declare function apply(ctx: Context, config: Config): void;
export {};
