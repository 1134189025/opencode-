#!/usr/bin/env bun
/**
 * Prompt Enhancer 配置同步服务器
 *
 * 在本地起一个微型 HTTP 服务，让 GUI 页面能够直接读写配置文件。
 * 运行方式: bun run config-server.ts
 * 或者:    npx tsx config-server.ts
 *
 * 启动后会自动打开浏览器到 GUI 页面。
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { createServer, type IncomingMessage, type ServerResponse } from "http"

const PLUGIN_DIR = dirname(import.meta.path)
const CONFIG_PATH = join(PLUGIN_DIR, "prompt-enhancer-config.json")
const GUI_DIR = join(PLUGIN_DIR, "gui")
const PORT = 19827

const MIME_TYPES: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
}

function getContentType(path: string): string {
    const ext = path.slice(path.lastIndexOf("."))
    return MIME_TYPES[ext] || "application/octet-stream"
}

function corsHeaders(): Record<string, string> {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
}

function sendJSON(res: ServerResponse, data: any, status = 200) {
    res.writeHead(status, { "Content-Type": "application/json", ...corsHeaders() })
    res.end(JSON.stringify(data))
}

function readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve) => {
        let body = ""
        req.on("data", (chunk: Buffer) => (body += chunk.toString()))
        req.on("end", () => resolve(body))
    })
}

const server = createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://localhost:${PORT}`)

    // CORS preflight
    if (req.method === "OPTIONS") {
        res.writeHead(204, corsHeaders())
        res.end()
        return
    }

    // API: Get config
    if (url.pathname === "/api/config" && req.method === "GET") {
        try {
            if (existsSync(CONFIG_PATH)) {
                const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"))
                sendJSON(res, config)
            } else {
                // No config file yet — import the full defaults from config.ts (includes all 6 built-in profiles)
                const { loadConfig } = await import("./config")
                const defaults = loadConfig(PLUGIN_DIR)
                sendJSON(res, defaults)
            }
        } catch (err: any) {
            sendJSON(res, { error: err.message }, 500)
        }
        return
    }

    // API: Save config
    if (url.pathname === "/api/config" && (req.method === "POST" || req.method === "PUT")) {
        try {
            const body = await readBody(req)
            const config = JSON.parse(body)
            const dir = dirname(CONFIG_PATH)
            if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
            writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8")
            sendJSON(res, { ok: true, message: "配置已保存" })
        } catch (err: any) {
            sendJSON(res, { error: err.message }, 500)
        }
        return
    }

    // API: Get history
    const HISTORY_PATH = join(PLUGIN_DIR, "prompt-enhancer-history.json")
    const MAX_HISTORY = 50

    if (url.pathname === "/api/history" && req.method === "GET") {
        try {
            if (existsSync(HISTORY_PATH)) {
                const data = JSON.parse(readFileSync(HISTORY_PATH, "utf-8"))
                sendJSON(res, Array.isArray(data) ? data : [])
            } else {
                sendJSON(res, [])
            }
        } catch {
            sendJSON(res, [])
        }
        return
    }

    // API: Add history record
    if (url.pathname === "/api/history" && req.method === "POST") {
        try {
            const body = await readBody(req)
            const record = JSON.parse(body)
            let history: any[] = []
            if (existsSync(HISTORY_PATH)) {
                try {
                    const raw = JSON.parse(readFileSync(HISTORY_PATH, "utf-8"))
                    if (Array.isArray(raw)) history = raw
                } catch {}
            }
            history.push(record)
            if (history.length > MAX_HISTORY) {
                history = history.slice(-MAX_HISTORY)
            }
            writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), "utf-8")
            sendJSON(res, { ok: true, count: history.length })
        } catch (err: any) {
            sendJSON(res, { error: err.message }, 500)
        }
        return
    }

    // Static files: serve GUI
    let filePath = url.pathname === "/" ? "/index.html" : url.pathname
    const fullPath = join(GUI_DIR, filePath)

    if (existsSync(fullPath)) {
        const content = readFileSync(fullPath)
        res.writeHead(200, { "Content-Type": getContentType(fullPath), ...corsHeaders() })
        res.end(content)
    } else {
        res.writeHead(404, corsHeaders())
        res.end("Not Found")
    }
})

server.listen(PORT, () => {
    console.log(`\n  ✨ Prompt Enhancer 配置面板`)
    console.log(`  ─────────────────────────────`)
    console.log(`  🌐 打开浏览器访问: http://localhost:${PORT}`)
    console.log(`  📁 配置文件路径:   ${CONFIG_PATH}`)
    console.log(`\n  按 Ctrl+C 停止服务\n`)

    // 尝试自动打开浏览器
    const { exec } = require("child_process")
    const openCmd =
        process.platform === "win32"
            ? `start http://localhost:${PORT}`
            : process.platform === "darwin"
                ? `open http://localhost:${PORT}`
                : `xdg-open http://localhost:${PORT}`
    exec(openCmd)
})
