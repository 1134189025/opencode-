/**
 * Prompt Enhancer GUI - 配置管理面板
 *
 * 两种模式：
 * 1. Server 模式：通过 config-server.ts 的 HTTP API 直接读写配置文件（推荐）
 * 2. 离线模式：localStorage + 手动导出 JSON 文件放到插件目录
 */

const DEFAULT_PROFILE_ID = "default-profile"
const DEFAULT_PROMPT = `你是一个专门为 AI 编程助手优化提示词的专家。用户会用口语化的方式描述编程需求，你需要将其转换为结构清晰、信息完整的专业编程提示词。

## 转换规则

1. **意图保留**：严格保留用户原始意图，不添加用户未提及的功能
2. **技术明确**：推断并补充可能的技术栈、语言、框架信息
3. **结构化输出**：用清晰的层级组织需求（目标、要求、约束）
4. **边界条件**：补充合理的错误处理、边界情况考虑
5. **可执行性**：确保输出的提示词可以直接被 AI 编程助手执行

## 格式要求

- 第一行用一句话概括核心任务
- 分点列出具体要求
- 如涉及文件操作，明确文件路径和操作类型
- 保持与用户输入相同的语言

## 示例

输入：帮我搞个暗色主题
输出：为当前项目实现暗色主题支持。要求：
1. 定义暗色主题的 CSS 变量（背景色、文字色、边框色、强调色等）
2. 添加主题切换机制（class 或 data-attribute 方式）
3. 确保所有现有组件兼容暗色模式
4. 过渡动画平滑（transition 0.2s）

输入：这个函数有bug
输出：请检查当前文件中的相关函数，分析可能存在的 bug。具体要求：
1. 检查边界条件和异常输入的处理
2. 验证返回值是否在所有分支中都正确
3. 找到问题后直接修复，并解释 bug 的原因

## 重要

- 只输出优化后的提示词，不要解释修改过程
- 简短输入（<10字）适度扩展，长输入主要做结构化整理
- 不要过度扩展，保持精简`

const DEFAULT_CONFIG = {
    enabled: false,
    apiUrl: "https://api.openai.com/v1/chat/completions",
    apiKey: "",
    model: "gpt-4o-mini",
    activeProfileId: DEFAULT_PROFILE_ID,
    profiles: [
        {
            id: DEFAULT_PROFILE_ID,
            name: "默认优化",
            prompt: DEFAULT_PROMPT
        },
        {
            id: "profile-frontend-expert",
            name: "前端专家",
            prompt: `你是一位资深前端工程师，精通 React、Vue、Svelte、Next.js、TypeScript、CSS 动画、响应式布局和 Web 性能优化。

用户会用口语描述前端需求，你需要将其转化为可直接执行的前端开发提示词。

## 转换规则
1. 明确使用的框架/库版本（如 React 18、Vue 3）
2. 指定组件结构、状态管理方案、样式方案（CSS Modules / Tailwind / styled-components）
3. 补充响应式断点、无障碍 (a11y) 和浏览器兼容性要求
4. 涉及动画时，明确使用 CSS transition/animation 还是 Framer Motion 等库
5. 涉及性能时，指出需要 lazy loading、虚拟滚动或 memoization 等具体手段

## 格式要求
- 第一行概括核心 UI 任务
- 分点列出组件结构、交互行为、样式要求
- 只输出优化后的提示词`
        },
        {
            id: "profile-backend-expert",
            name: "后端专家",
            prompt: `你是一位资深后端架构师，精通 Node.js、Go、Python、Rust、数据库设计、API 设计、微服务和系统架构。

用户会用口语描述后端需求，你需要将其转化为可直接执行的后端开发提示词。

## 转换规则
1. 明确技术栈（语言、框架、ORM、数据库类型）
2. 指定 API 风格（RESTful / GraphQL / gRPC）和认证方式（JWT / OAuth / Session）
3. 补充数据校验、错误处理、日志记录等工程化要求
4. 涉及数据库时，明确表结构、索引策略、关联关系
5. 涉及并发/性能时，指出缓存策略、队列、连接池等方案

## 格式要求
- 第一行概括核心服务/接口任务
- 分点列出数据模型、接口契约、安全要求
- 只输出优化后的提示词`
        },
        {
            id: "profile-copywriting-expert",
            name: "文案专家",
            prompt: `你是一位顶级文案策划，精通品牌传播、社交媒体运营、广告文案、SEO 写作和用户增长话术。

用户会用口语描述文案需求，你需要将其转化为结构清晰的文案创作提示词。

## 转换规则
1. 明确文案场景（社交媒体帖子 / 产品详情页 / 邮件营销 / 广告落地页）
2. 指定目标受众画像和期望的情感基调（专业严谨 / 轻松活泼 / 紧迫促销）
3. 补充字数限制、关键词植入、CTA（行动号召）要求
4. 涉及多语言时，明确语言和本地化风格
5. 指出参考竞品或行业标杆风格

## 格式要求
- 第一行概括核心文案任务和场景
- 分点列出调性、受众、格式和 SEO 关键词要求
- 只输出优化后的提示词`
        },
        {
            id: "profile-image-gen-expert",
            name: "生图专家",
            prompt: `你是一位 AI 生图提示词工程师，精通 Midjourney、Stable Diffusion、DALL·E、Flux 等文生图模型的提示词编写技巧。

用户会用口语描述想要的图片，你需要将其转化为高质量的英文生图提示词（Prompt）。

## 转换规则
1. **主体描述**：清晰定义画面主体、姿态、表情、服装
2. **场景氛围**：描述背景、光线（如 golden hour、studio lighting）、色调
3. **风格关键词**：指定艺术风格（photorealistic / anime / watercolor / cyberpunk 等）
4. **技术参数**：补充画质修饰词（8k, ultra detailed, masterpiece, best quality）
5. **负面提示**（如需要）：列出 negative prompt 关键词
6. 输出必须为英文，因为生图模型对英文提示词效果最佳

## 格式要求
- 输出为一整段英文 prompt，用逗号分隔关键词
- 如果有 negative prompt，单独一行以 "Negative:" 开头
- 只输出提示词本身，不要解释`
        },
        {
            id: "profile-storyboard-expert",
            name: "电影分镜专家",
            prompt: `你是一位专业的电影分镜师和视觉叙事专家，精通镜头语言、蒙太奇手法、景别运用和影视编剧技巧。

用户会用口语描述影片场景或故事概念，你需要将其转化为专业的分镜脚本提示词。

## 转换规则
1. **镜号与景别**：为每个镜头编号，标注景别（远景/全景/中景/近景/特写）
2. **镜头运动**：指定运镜方式（推/拉/摇/移/跟/升降/手持/航拍）
3. **画面内容**：描述画面主体、构图、前景/背景关系
4. **声音设计**：标注同期声、配乐、音效的要求
5. **时长与节奏**：估算每个镜头时长，标注剪辑节奏（快切/长镜头/叠化）
6. **情绪基调**：指明每场的情绪氛围和色调倾向

## 格式要求
- 每个镜头编号列出：景别 | 运镜 | 画面描述 | 声音 | 时长
- 场与场之间用分隔线区分
- 只输出分镜脚本，不要解释`
        }
    ]
}

const STORAGE_KEY = "prompt-enhancer-config"
const API_BASE = "http://localhost:19827"

let serverAvailable = false

// ============= DOM Elements =============
const $ = (id) => document.getElementById(id)

const elements = {
    enableToggle: $("enableToggle"),
    masterSwitch: $("masterSwitch"),
    switchStatus: $("switchStatus"),
    apiUrl: $("apiUrl"),
    apiKey: $("apiKey"),
    toggleKey: $("toggleKey"),
    model: $("model"),
    systemPrompt: $("systemPrompt"),
    saveBtn: $("saveBtn"),
    resetBtn: $("resetBtn"),
    testBtn: $("testBtn"),
    fetchModelsBtn: $("fetchModelsBtn"),
    toast: $("toast"),
    profileTabs: $("profileTabs"),
    addProfileBtn: $("addProfileBtn"),
    deleteProfileBtn: $("deleteProfileBtn"),
    historyToggle: $("historyToggle"),
    historyList: $("historyList"),
    historyBadge: $("historyBadge"),
    historyArrow: $("historyArrow"),
}

// 核心状态保存
let currentConfig = null


// ============= Server Detection =============
async function checkServer() {
    try {
        const res = await fetch(`${API_BASE}/api/config`, {
            method: "GET",
            signal: AbortSignal.timeout(1000),
        })
        serverAvailable = res.ok
    } catch {
        serverAvailable = false
    }
    return serverAvailable
}

// ============= Config Management =============
async function loadConfig() {
    if (serverAvailable) {
        try {
            const res = await fetch(`${API_BASE}/api/config`)
            if (res.ok) {
                const saved = await res.json()
                return { ...DEFAULT_CONFIG, ...saved }
            }
        } catch { }
    }
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) }
    } catch { }
    return { ...DEFAULT_CONFIG }
}

async function saveConfigToStorage(config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))

    if (serverAvailable) {
        try {
            const res = await fetch(`${API_BASE}/api/config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            })
            return res.ok
        } catch { }
    }
    return false
}

function getConfigFromForm() {
    return {
        enabled: elements.enableToggle.checked,
        apiUrl: elements.apiUrl.value.trim(),
        apiKey: elements.apiKey.value.trim(),
        model: elements.model.value.trim(),
        systemPrompt: elements.systemPrompt.value.trim(), // 保持旧字段以防降级
        activeProfileId: currentConfig.activeProfileId,
        profiles: currentConfig.profiles,
    }
}

function populateForm(config) {
    currentConfig = config
    elements.enableToggle.checked = config.enabled
    elements.apiUrl.value = config.apiUrl
    elements.apiKey.value = config.apiKey
    elements.model.value = config.model
    
    // 兼容迁移代码（防止读取的是旧配置）
    if (!currentConfig.profiles || currentConfig.profiles.length === 0) {
        currentConfig.profiles = [{
            id: DEFAULT_PROFILE_ID,
            name: "默认优化",
            prompt: config.systemPrompt || DEFAULT_PROMPT
        }];
        currentConfig.activeProfileId = DEFAULT_PROFILE_ID;
    }
    if (!currentConfig.activeProfileId) {
        currentConfig.activeProfileId = currentConfig.profiles[0].id;
    }

    renderProfileTabs()
    updateSwitchUI(config.enabled)
}

function renderProfileTabs() {
    elements.profileTabs.innerHTML = "";
    currentConfig.profiles.forEach(p => {
        const btn = document.createElement("button");
        btn.className = "profile-tab" + (p.id === currentConfig.activeProfileId ? " active" : "");
        btn.textContent = p.name;
        btn.type = "button";
        btn.onclick = () => {
            currentConfig.activeProfileId = p.id;
            renderProfileTabs();
        };
        elements.profileTabs.appendChild(btn);
    });
    
    // 同步 textarea 内容
    const active = currentConfig.profiles.find(p => p.id === currentConfig.activeProfileId);
    if (active) {
        elements.systemPrompt.value = active.prompt;
    }
    
    // Show/hide delete button
    elements.deleteProfileBtn.style.display = currentConfig.profiles.length > 1 ? "flex" : "none";
}

function updateSwitchUI(enabled) {
    if (enabled) {
        elements.masterSwitch.classList.add("active")
        elements.switchStatus.textContent = "已开启 · 大白话将自动转为专业提示词"
    } else {
        elements.masterSwitch.classList.remove("active")
        elements.switchStatus.textContent = "已关闭"
    }
}

// ============= Toast =============
let toastTimer = null

function showToast(message, type = "success") {
    const toast = elements.toast
    toast.textContent = message
    toast.className = `toast ${type}`
    clearTimeout(toastTimer)

    requestAnimationFrame(() => {
        toast.classList.add("show")
        toastTimer = setTimeout(() => {
            toast.classList.remove("show")
        }, 2500)
    })
}

// ============= History =============
async function loadHistory() {
    if (!serverAvailable) {
        elements.historyBadge.textContent = "-";
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/api/history`);
        if (res.ok) {
            const records = await res.json();
            renderHistory(records);
        }
    } catch {}
}

function renderHistory(records) {
    const list = elements.historyList;
    list.innerHTML = "";
    elements.historyBadge.textContent = records.length;
    
    if (records.length === 0) {
        list.innerHTML = '<div class="history-empty">还没有历史记录，开启插件后发送消息即可生成</div>';
        return;
    }
    
    // 倒序显示（最新的在最上面）
    const sorted = [...records].reverse();
    sorted.forEach(r => {
        const item = document.createElement("div");
        item.className = "history-item";
        
        const time = new Date(r.timestamp).toLocaleString("zh-CN", {
            month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit"
        });
        
        item.innerHTML = `
            <div class="history-meta">
                <span>${time}</span>
                <span class="history-profile-tag">${r.profileName || "默认"}</span>
            </div>
            <div class="history-compare">
                <div class="history-original">${escapeHTML(r.original || "")}</div>
                <div class="history-arrow">→</div>
                <div class="history-enhanced">${escapeHTML(r.enhanced || "")}</div>
            </div>
        `;
        list.appendChild(item);
    });
}

function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// ============= File Download =============
function downloadConfig(config) {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "prompt-enhancer-config.json"
    a.click()
    URL.revokeObjectURL(url)
}

// ============= API Test =============
async function testAPI() {
    const config = getConfigFromForm()
    if (!config.apiUrl || !config.apiKey) {
        showToast("请先填写 API 地址和 Key", "error")
        return
    }

    elements.testBtn.innerHTML = '<span class="spinner"></span>测试中...'
    elements.testBtn.disabled = true

    try {
        const res = await fetch(config.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: "system", content: "Reply with OK" },
                    { role: "user", content: "test" },
                ],
                max_tokens: 5,
            }),
        })

        if (res.ok) {
            const data = await res.json()
            const reply = data.choices?.[0]?.message?.content || "OK"
            showToast(`✅ 连接成功！模型回复：${reply}`, "success")
        } else {
            const errText = await res.text()
            showToast(`❌ 请求失败 (${res.status})：${errText.slice(0, 80)}`, "error")
        }
    } catch (err) {
        showToast(`❌ 连接失败：${err.message}`, "error")
    } finally {
        elements.testBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5h0c-1.4 0-2.5-1.1-2.5-2.5V2" />
                <path d="M8.5 2h7" />
                <path d="M14.5 16h-5" />
            </svg>
            测试连接状态
        `
        elements.testBtn.disabled = false
    }
}

// ============= Fetch Models =============
async function fetchModels() {
    const config = getConfigFromForm()
    if (!config.apiUrl || !config.apiKey) {
        showToast("请先填写 API 地址和 Key", "error")
        return
    }

    // 根据 chat completions 地址推断 models 端点 (比如把 /chat/completions 替换为空)
    let modelsUrl = config.apiUrl
    if (modelsUrl.endsWith("/chat/completions")) {
        modelsUrl = modelsUrl.replace("/chat/completions", "/models")
    } else if (!modelsUrl.endsWith("/models")) {
        // 如果是类似 https://api.openai.com/v1 的根地址
        modelsUrl = modelsUrl.replace(/\/$/, "") + "/models"
    }

    const btn = elements.fetchModelsBtn
    const originalText = btn.innerHTML
    btn.innerHTML = '<span class="spinner" style="width:12px; height:12px; border-width:2px; margin-right:4px; vertical-align:-2px;"></span>获取中'
    btn.disabled = true

    try {
        const res = await fetch(modelsUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.apiKey}`,
            }
        })

        if (res.ok) {
            const data = await res.json()
            const models = data.data || []
            
            if (models.length === 0) {
                showToast("获取成功，但该接口未返回任何可用模型", "info")
                return
            }

            // 提取模型 ID 并按字母排序
            const modelIds = models.map(m => m.id).sort()
            
            // 创建一个原生的 select 元素覆盖在输入框上（简化实现真正的下拉选择）
            showModelSelector(modelIds)
            showToast(`✅ 成功获取 ${modelIds.length} 个模型`, "success")
        } else {
            const errText = await res.text()
            showToast(`❌ 获取失败 (${res.status})：${errText.slice(0, 50)}`, "error")
        }
    } catch (err) {
        showToast(`❌ 获取异常：${err.message}`, "error")
    } finally {
        btn.innerHTML = originalText
        btn.disabled = false
    }
}

function showModelSelector(modelIds) {
    const input = elements.model
    
    // 移除已存在的选择器
    const existing = document.getElementById("modelSelector")
    if (existing) existing.remove()

    const closeSelector = () => {
        const sel = document.getElementById("modelSelector")
        if (sel) sel.remove()
    }

    // 计算输入框在全页面中的绝对位置
    const rect = input.getBoundingClientRect()

    // 创建带阴影的悬浮框
    const selector = document.createElement("div")
    selector.id = "modelSelector"
    Object.assign(selector.style, {
        position: "absolute",
        top: `${rect.bottom + window.scrollY + 4}px`,
        left: `${rect.left + window.scrollX}px`,
        width: `${rect.width}px`,
        maxHeight: "250px",
        overflowY: "auto",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: "12px",
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.15)",
        zIndex: "1000",
        padding: "4px 0",
        display: "flex",
        flexDirection: "column"
    })

    // 搜索框（针对模型极多的情况）
    const searchWrap = document.createElement("div")
    searchWrap.style.padding = "4px 12px 8px 12px"
    searchWrap.style.borderBottom = "1px solid rgba(0,0,0,0.05)"
    searchWrap.style.position = "sticky"
    searchWrap.style.top = "0"
    searchWrap.style.backgroundColor = "rgba(255,255,255,0.95)"
    
    const searchInput = document.createElement("input")
    searchInput.type = "text"
    searchInput.placeholder = "搜索模型..."
    Object.assign(searchInput.style, {
        width: "100%",
        padding: "6px 10px",
        fontSize: "13px",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: "6px",
        outline: "none",
        backgroundColor: "rgba(0,0,0,0.02)"
    })

    searchWrap.appendChild(searchInput)
    selector.appendChild(searchWrap)

    const listWrap = document.createElement("div")
    selector.appendChild(listWrap)

    const renderList = (filter = "") => {
        listWrap.innerHTML = ""
        const filtered = modelIds.filter(id => id.toLowerCase().includes(filter.toLowerCase()))
        
        if (filtered.length === 0) {
            const noRes = document.createElement("div")
            noRes.textContent = "无匹配结果"
            noRes.style.padding = "10px 16px"
            noRes.style.fontSize = "13px"
            noRes.style.color = "#86868b"
            noRes.style.textAlign = "center"
            listWrap.appendChild(noRes)
            return
        }

        filtered.forEach(id => {
            const item = document.createElement("div")
            item.textContent = id
            Object.assign(item.style, {
                padding: "10px 16px",
                fontSize: "14px",
                color: "#1d1d1f",
                fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
                cursor: "pointer",
                transition: "background 0.2s"
            })
            
            item.addEventListener("mouseover", () => item.style.backgroundColor = "rgba(0, 113, 227, 0.08)")
            item.addEventListener("mouseout", () => item.style.backgroundColor = "transparent")
            
            item.addEventListener("click", () => {
                input.value = id
                closeSelector()
                saveConfig() // 选中后自动保存
            })
            
            listWrap.appendChild(item)
        })
    }

    renderList()

    searchInput.addEventListener("input", (e) => renderList(e.target.value))

    // 将下拉框直接塞入 body，避免被 bento-card 的 overflow: hidden 截断或因为 z-index 导致遮挡
    document.body.appendChild(selector)

    // 监听窗口大小变化自动关闭
    const autoClose = () => closeSelector()
    window.addEventListener("resize", autoClose, { once: true })

    // 点击外部关闭
    setTimeout(() => {
        const closeList = (e) => {
            if (!selector.contains(e.target) && e.target !== elements.fetchModelsBtn) {
                closeSelector()
                document.removeEventListener("click", closeList)
                window.removeEventListener("resize", autoClose)
            }
        }
        document.addEventListener("click", closeList)
    }, 0)
    
    searchInput.focus()
}

// ============= Save Logic =============
// manual=true 表示用户主动点击保存按钮，离线模式下才触发文件下载
// manual=false 表示自动保存（开关切换、选模型等），离线模式下只存 localStorage
async function saveConfig(manual = false) {
    const config = getConfigFromForm()

    if (config.enabled && !config.apiKey) {
        showToast("⚠️ 已开启但未设置 API Key", "error")
        return
    }

    const serverSaved = await saveConfigToStorage(config)

    if (serverSaved) {
        showToast("✅ 设置已保存到插件配置文件", "success")
    } else if (manual) {
        // 离线模式 + 手动保存：下载配置文件让用户手动放到插件目录
        downloadConfig(config)
        showToast("✅ 已保存到浏览器，配置文件已下载（请放到插件目录）", "info")
    }
}

// ============= Event Listeners =============
elements.enableToggle.addEventListener("change", async (e) => {
    updateSwitchUI(e.target.checked)
    await saveConfig() // 自动保存实时状态
})

elements.toggleKey.addEventListener("click", () => {
    const input = elements.apiKey
    if (input.type === "password") {
        input.type = "text"
        elements.toggleKey.textContent = "🔒"
    } else {
        input.type = "password"
        elements.toggleKey.textContent = "👁"
    }
})

elements.saveBtn.addEventListener("click", () => saveConfig(true))

elements.resetBtn.addEventListener("click", async () => {
    if (confirm("确认重置为默认设置？")) {
        populateForm(DEFAULT_CONFIG)
        await saveConfigToStorage(DEFAULT_CONFIG)
        showToast("已重置为默认配置", "info")
    }
})

elements.testBtn.addEventListener("click", testAPI)
elements.fetchModelsBtn.addEventListener("click", fetchModels)

// Profile Events
elements.systemPrompt.addEventListener("input", (e) => {
    if (currentConfig && currentConfig.activeProfileId) {
        const active = currentConfig.profiles.find(p => p.id === currentConfig.activeProfileId);
        if (active) {
            active.prompt = e.target.value;
        }
    }
});

elements.addProfileBtn.addEventListener("click", () => {
    const name = prompt("请输入新预设的名称 (如: 前端专家)：", "新预设");
    if (!name || !name.trim()) return;
    
    const id = "profile-" + Date.now();
    currentConfig.profiles.push({
        id,
        name: name.trim(),
        prompt: "你是一个专业的AI编程助手..." // 给个简单的初始模板
    });
    currentConfig.activeProfileId = id;
    renderProfileTabs();
    saveConfig(); // 新增后直接存盘，体验更连贯
});

elements.deleteProfileBtn.addEventListener("click", () => {
    if (currentConfig.profiles.length <= 1) return;
    if (confirm("确定要删除当前预设吗？删除后无法恢复。")) {
        currentConfig.profiles = currentConfig.profiles.filter(p => p.id !== currentConfig.activeProfileId);
        currentConfig.activeProfileId = currentConfig.profiles[0].id;
        renderProfileTabs();
        saveConfig();
    }
});

// History Toggle
elements.historyToggle.addEventListener("click", () => {
    elements.historyList.classList.toggle("open");
    elements.historyArrow.classList.toggle("open");
});

// ============= Initialize =============
document.addEventListener("DOMContentLoaded", async () => {
    await checkServer()
    const config = await loadConfig()
    populateForm(config)

    if (serverAvailable) {
        showToast("🟢 已连接配置服务器", "success")
    }

    // 加载历史记录
    await loadHistory()

    // ============= Spotlight Mouse Tracking =============
    document.querySelectorAll(".bento-card, .master-switch").forEach(card => {
        card.addEventListener("mousemove", e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        });
    });

    // ============= Mouse Drag to Scroll for Profile Tabs =============
    const slider = elements.profileTabs;
    let isDown = false;
    let isDragging = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        isDragging = false;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    
    const cancelSmoothScroll = () => {
        if(slider.style.scrollBehavior !== 'auto') {
            slider.style.scrollBehavior = 'auto';
        }
    };
    
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = '';
        slider.style.scrollBehavior = '';
    });
    
    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = '';
        slider.style.scrollBehavior = '';
    });
    
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        
        const x = e.pageX - slider.offsetLeft;
        if (Math.abs(x - startX) > 5) {
            isDragging = true; // 移动超过 5px 判定为拖拽
        }
        
        e.preventDefault(); // 防止拖拽选中文字
        cancelSmoothScroll();
        const walk = (x - startX) * 2; // 数字越大滑得越快
        slider.scrollLeft = scrollLeft - walk;
    });

    // 拦截拖拽时产生的 click 误触
    slider.addEventListener('click', (e) => {
        if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
            isDragging = false;
        }
    }, true); // 使用 true (capture) 在捕获阶段拦截
})
