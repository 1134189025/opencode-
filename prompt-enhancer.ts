import type { Plugin } from "@opencode-ai/plugin"
import { loadConfig } from "./config"
import { dirname } from "path"

/**
 * Prompt Enhancer Plugin for OpenCode
 *
 * 拦截用户消息，通过 OpenAI 兼容 API 将大白话转换为专业提示词。
 * 配置通过 GUI 控制面板或直接编辑 JSON 文件管理。
 */
export const PromptEnhancer: Plugin = async (ctx) => {
    const pluginDir = dirname(import.meta.path)

    await ctx.client.app.log({
        body: {
            service: "prompt-enhancer",
            level: "info",
            message: "Prompt Enhancer 插件已加载",
        },
    })

    return {
        "chat.message": async (input, output) => {
            // 每次触发时重新读取配置，确保 GUI 修改能实时生效
            const config = loadConfig(pluginDir)

            if (!config.enabled) {
                return
            }

            if (!config.apiKey || !config.apiUrl) {
                await ctx.client.app.log({
                    body: {
                        service: "prompt-enhancer",
                        level: "warn",
                        message: "API Key 或 API URL 未配置，跳过提示词优化",
                    },
                })
                return
            }

            // 从 parts 中提取用户消息文本
            // output.parts 是 Part[] 类型，每个 Part 包含 type 和内容
            const textParts = output.parts.filter(
                (p: any) => p.type === "text"
            )

            if (textParts.length === 0) {
                return
            }

            // 拼接所有文本 part 的内容
            const originalContent = textParts
                .map((p: any) => p.text || p.content || "")
                .join("\n")
                .trim()

            // 跳过太短的消息（可能是指令、路径等）
            if (originalContent.length < 5) {
                return
            }

            try {
                // Find currently active profile prompt
                const activeProfile = config.profiles?.find(p => p.id === config.activeProfileId)
                const currentSystemPrompt = activeProfile ? activeProfile.prompt : (config.systemPrompt || "")

                const enhancedPrompt = await callLLM(config, currentSystemPrompt, originalContent)
                if (enhancedPrompt) {
                    // 就地修改第一个文本 part 的内容，保留原有的 id/sessionID 等字段
                    const firstTextPart = output.parts.find(
                        (p: any) => p.type === "text"
                    ) as any
                    if (firstTextPart) {
                        firstTextPart.text = enhancedPrompt
                        // 如果有 content 字段也同步修改
                        if ("content" in firstTextPart) {
                            firstTextPart.content = enhancedPrompt
                        }
                    }

                    await ctx.client.app.log({
                        body: {
                            service: "prompt-enhancer",
                            level: "info",
                            message: `提示词已优化: "${originalContent.slice(0, 50)}..." → "${enhancedPrompt.slice(0, 50)}..."`,
                        },
                    })

                    // 异步写入历史记录（不阻塞主流程）
                    fetch("http://localhost:19827/api/history", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            original: originalContent.slice(0, 500),
                            enhanced: enhancedPrompt.slice(0, 500),
                            profileName: activeProfile?.name || "未知预设",
                            timestamp: Date.now()
                        })
                    }).catch(() => {}) // 静默失败
                }
            } catch (err: any) {
                // 出错时不阻塞，保留原始消息
                await ctx.client.app.log({
                    body: {
                        service: "prompt-enhancer",
                        level: "error",
                        message: `提示词优化失败: ${err.message}`,
                    },
                })
            }
        },
    }
}

/**
 * 调用 OpenAI 兼容 API 进行提示词优化
 */
async function callLLM(
    config: { apiUrl: string; apiKey: string; model: string },
    systemPrompt: string,
    userMessage: string,
): Promise<string | null> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000) // 15s 超时

    try {
        const response = await fetch(config.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage },
                ],
                temperature: 0.3,
                max_tokens: 2048,
            }),
            signal: controller.signal,
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`API 请求失败 (${response.status}): ${errorText}`)
        }

        const data = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>
        }

        return data.choices?.[0]?.message?.content?.trim() ?? null
    } finally {
        clearTimeout(timeout)
    }
}
