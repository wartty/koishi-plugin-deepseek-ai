var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Config: () => Config,
  apply: () => apply,
  name: () => name,
  usage: () => usage
});
module.exports = __toCommonJS(src_exports);
var import_koishi = require("koishi");
var name = "deepseek-ai";
var usage = "deepseek的api适配插件，可以调用官方的api来接入koishi。插件本身用deepseek开发，所以里面的代码其实还留有很多备注。本人并不是专业开发者，所以后续可能很难有更新，不过也可以关注也许，也许以后还能开发出更多功能？（笑）apikey请自行到官网 https://www.deepseek.com/ 创建获取，本插件并不提供。";
var Config = import_koishi.Schema.object({
  apiKey: import_koishi.Schema.string().required().description("DeepSeek API密钥"),
  apiEndpoint: import_koishi.Schema.string().description("API端点").default("https://api.deepseek.com/v1"),
  defaultModelIndex: import_koishi.Schema.number().min(1).description("默认模型索引（从1开始）").default(1),
  presets: import_koishi.Schema.array(
    import_koishi.Schema.object({
      name: import_koishi.Schema.string().required().description("预设名称"),
      content: import_koishi.Schema.string().required().description("预设内容")
    })
  ).description("预设列表").default([]),
  defaultPresetIndex: import_koishi.Schema.number().min(1).description("默认预设索引（从1开始）").default(1),
  enableReasoner: import_koishi.Schema.boolean().description("启用DeepSeek-R1推理模型优化").default(false),
  timeout: import_koishi.Schema.number().description("API请求超时时间（毫秒）").default(1e4),
  waitingMessage: import_koishi.Schema.string().description("等待提示消息").default("请求处理中，请稍候..."),
  requestLimit: import_koishi.Schema.number().description("API请求次数限制（0或负数表示无限制）").default(0),
  maxHistory: import_koishi.Schema.number().description("历史消息缓存限制（0或负数表示无限制）").default(10),
  apiErrorText: import_koishi.Schema.string().description("API请求失败提示内容").default("请求处理失败，请稍后重试"),
  creativity: import_koishi.Schema.number().min(0).max(2).step(0.1).description("创意活跃度 (范围为0～2，值越大回答越有创意)").default(1),
  openness: import_koishi.Schema.number().min(0).max(1).step(0.1).description("思维开放度 (范围为0～1，值越大考虑可能性越多)").default(1),
  divergence: import_koishi.Schema.number().min(-2).max(2).step(0.1).description("表述发散度 (范围为-2～2，值越大表达越多样)").default(0),
  vocabulary: import_koishi.Schema.number().min(-2).max(2).step(0.1).description("词汇丰富度 (范围为-2～2，值越大用词越丰富)").default(0)
});
function apply(ctx, config) {
  let models = [];
  let currentModelIndex = config.defaultModelIndex - 1;
  let currentPresetIndex = config.defaultPresetIndex - 1;
  const userRequestCounts = {};
  const userHistory = {};
  ctx.on("ready", async () => {
    try {
      const response = await ctx.http.get(`${config.apiEndpoint}/models`, {
        headers: { Authorization: `Bearer ${config.apiKey}` }
      });
      models = response.data.map((model) => model.id);
      currentModelIndex = Math.min(currentModelIndex, models.length - 1);
      ctx.logger.info(`加载模型成功：${models.join(", ")}`);
    } catch (error) {
      ctx.logger.error("模型加载失败:", error);
    }
  });
  function getAllPresets() {
    return config.presets;
  }
  __name(getAllPresets, "getAllPresets");
  async function addPreset(name2, content) {
    const newPreset = { name: name2, content };
    config.presets = [...config.presets, newPreset];
    await ctx.scope.update(config);
    ctx.logger.info(`已添加预设：${name2}`);
    return newPreset;
  }
  __name(addPreset, "addPreset");
  async function removePreset(index) {
    if (index < 0 || index >= config.presets.length) {
      throw new Error("无效预设索引");
    }
    const removedPreset = config.presets[index];
    config.presets = config.presets.filter((_, i) => i !== index);
    await ctx.scope.update(config);
    ctx.logger.info(`已删除预设：${removedPreset.name}`);
    return removedPreset;
  }
  __name(removePreset, "removePreset");
  function clearUserHistory(userId) {
    if (userHistory[userId]) {
      delete userHistory[userId];
      ctx.logger.info(`已清除用户 ${userId} 的历史消息`);
    }
  }
  __name(clearUserHistory, "clearUserHistory");
  ctx.command("deepseek", "调用deepseek").usage("使用说明：切换模型请使用二级命令-m，列出的模型前面标有序号只需要跟着后面的序号即可。切换预设也是一样的，如果已经配置了预设切换就只需要输入预设前的序号就行，删除预设也是一样的。添加预设略有不同，执行完二级指令-a后根据机器人输出的提示输入预设名称和内容即可，而列出预设和模型用法和添加预设类似，唯一不同的是列出预设只需执行完-l即可。二级指令的使用示例：deepseek -m 1（示例只示范了切换模型的用法，像是添加预设只需要deepseek -a即可）。").alias("say").option("model", "-m <index:number> 切换模型").option("preset", "-p <index:number> 切换预设").option("list", "-l 列出模型和预设").option("addPreset", "-a 添加预设").option("removePreset", "-r <index:number> 删除预设").option("clearHistory", "-c 清除历史消息缓存").action(async ({ session, options }, message) => {
    const userId = session.userId;
    if (options?.clearHistory) {
      clearUserHistory(userId);
      return "已清除历史消息缓存";
    }
    if (options?.list) {
      const modelList = models.map((m, i) => `${i + 1}. ${m}${i === currentModelIndex ? " (当前使用)" : ""}`).join("\n");
      const presets = getAllPresets();
      const presetList = presets.map((p, i) => `${i + 1}. ${p.name}${i === currentPresetIndex ? " (当前使用)" : ""}`).join("\n");
      const remainingRequests = config.requestLimit > 0 ? `
剩余调用次数：${config.requestLimit - (userRequestCounts[userId] || 0)}` : "\n剩余调用次数：无限制";
      return [
        `当前模型：${models[currentModelIndex]} (${currentModelIndex + 1}/${models.length})`,
        modelList && `
可用模型：
${modelList}`,
        presets.length ? `
当前预设：${presets[currentPresetIndex]?.name || "无"}` : "",
        presets.length ? `
可用预设：
${presetList}` : "",
        remainingRequests
      ].filter(Boolean).join("\n");
    }
    if (options?.model !== void 0) {
      const index = options.model - 1;
      if (index < 0 || index >= models.length) {
        return `无效模型索引，当前有 ${models.length} 个模型`;
      }
      currentModelIndex = index;
      return `已切换至模型：${models[index]}`;
    }
    if (options?.preset !== void 0) {
      const presets = getAllPresets();
      const index = options.preset - 1;
      if (index < 0 || index >= presets.length) {
        return `无效预设索引，当前有 ${presets.length} 个预设`;
      }
      currentPresetIndex = index;
      return `已切换至预设：${presets[index].name}`;
    }
    if (options?.addPreset) {
      if (!session) return "无法在非会话上下文中添加预设";
      await session.send("请输入预设名称：");
      const name2 = await session.prompt();
      if (!name2) return "预设名称不能为空";
      if (config.presets.some((p) => p.name === name2)) {
        return `预设名称 "${name2}" 已存在，请使用其他名称`;
      }
      await session.send("请输入预设内容：");
      const content = await session.prompt();
      if (!content) return "预设内容不能为空";
      const newPreset = await addPreset(name2, content);
      return `已添加预设：${newPreset.name}`;
    }
    if (options?.removePreset !== void 0) {
      const index = options.removePreset - 1;
      try {
        const removedPreset = await removePreset(index);
        return `已删除预设：${removedPreset.name}`;
      } catch (error) {
        return error.message;
      }
    }
    if (!message) return "请输入消息内容";
    if (config.requestLimit > 0) {
      const userRequestCount = userRequestCounts[userId] || 0;
      if (userRequestCount >= config.requestLimit) {
        return `您的 API 请求次数已达到上限（${config.requestLimit} 次）`;
      }
      userRequestCounts[userId] = userRequestCount + 1;
    }
    try {
      session?.send(config.waitingMessage);
      const presets = getAllPresets();
      const finalMessage = presets[currentPresetIndex] ? `${presets[currentPresetIndex].content}
${message}` : message;
      if (!userHistory[userId]) userHistory[userId] = [];
      userHistory[userId].push({ role: "user", content: finalMessage });
      if (config.maxHistory > 0 && userHistory[userId].length > config.maxHistory) {
        userHistory[userId] = userHistory[userId].slice(-config.maxHistory);
      }
      const response = await ctx.http.post(
        `${config.apiEndpoint}/chat/completions`,
        {
          model: models[currentModelIndex],
          messages: [...userHistory[userId]],
          temperature: config.creativity,
          top_p: config.openness,
          repetition_penalty: 1 + Math.abs(config.divergence) / 2,
          // 转换为1.0-2.0范围
          frequency_penalty: config.vocabulary
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json"
          },
          timeout: config.enableReasoner ? config.timeout * 2 : config.timeout
        }
      );
      const content = response.choices[0].message.content;
      userHistory[userId].push({ role: "assistant", content });
      if (config.enableReasoner) {
        const splitRegex = /\n\nFinal Answer:\s*/i;
        const parts = content.split(splitRegex);
        if (parts.length >= 2) {
          const reasoning = parts[0].trim();
          const answer = parts.slice(1).join("").trim();
          if (reasoning) session?.send(`推理过程：
${reasoning}`);
          return `最终答案：
${answer || "未提供最终答案"}`;
        }
      }
      return content;
    } catch (error) {
      ctx.logger.error("API请求失败:", error);
      return config.apiErrorText;
    }
  });
}
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  name,
  usage
});
