# ✨ Prompt Enhancer — OpenCode 提示词优化插件

> 让 AI 更懂你！输入大白话，自动转成专业提示词。

---

## 🤔 这是什么？

你在用 OpenCode 和 AI 对话时，可能会这样打字：

> "帮我搞个暗色主题"

这个插件会**自动**帮你把它优化成：

> "为当前项目实现暗色主题支持。要求：1. 定义暗色主题的 CSS 变量... 2. 添加主题切换机制..."

**你完全感知不到这个过程**，AI 收到的是优化后的提示词，回答质量会显著提升。

---

## 📦 安装（三步搞定）

### 第一步：下载插件文件

把这整个文件夹下载到你电脑上任意位置，比如桌面。

### 第二步：运行安装脚本

1. 找到文件夹里的 `install.bat`
2. **双击运行**
3. 等它跑完，看到 `Install complete!` 就行了

> 📌 它会把插件文件复制到 `C:\Users\你的用户名\.config\opencode\plugins\`

### 第三步：打开配置面板

1. 找到安装目录里的 `start-gui.bat`（默认在 `C:\Users\你的用户名\.config\opencode\plugins\start-gui.bat`）
2. **双击运行**
3. 浏览器会自动打开配置页面

**✅ 安装完成！** 接下来在配置面板里填写 API 信息就能用了。

---

## ⚙️ 配置（必须做一次）

插件需要一个 AI 接口才能工作。你需要准备：

- **API 地址**（API URL）
- **API 密钥**（API Key）
- **模型名称**（Model）

> 💡 不知道这些是什么？往下看「常见 API 服务」章节。

### 打开配置面板

1. 找到 `start-gui.bat`（如果你是安装到默认位置，在 `C:\Users\你的用户名\.config\opencode\plugins\start-gui.bat`）
2. **双击运行**
3. 浏览器会自动打开一个漂亮的配置页面

> ⚠️ 如果你电脑没有 Bun 也没有 Node.js，脚本会问你要不要自动安装。**选 1（安装 Bun）就行**，全自动的。

### 在配置面板里填写

| 设置项 | 填什么 | 例子 |
|--------|--------|------|
| **启用插件** | 打开开关 | ✅ |
| **API 地址** | 你的 AI 服务地址 | `https://api.openai.com/v1/chat/completions` |
| **API 密钥** | 你的 key | `sk-xxxxxxxxxxxxxxxx` |
| **模型** | 要用的模型名 | `gpt-4o-mini` |

填好后点 **保存**，搞定！

---

## 🎭 预设模式

插件内置了 6 种优化风格，可以在配置面板切换：

| 预设 | 适合场景 |
|------|---------|
| 🔧 默认优化 | 日常编程对话 |
| 🎨 前端专家 | 写页面、样式、组件 |
| ⚙️ 后端专家 | 写接口、数据库、架构 |
| ✍️ 文案专家 | 写文案、营销、推广 |
| 🖼️ 生图专家 | 生成 AI 绘图提示词 |
| 🎬 电影分镜专家 | 写分镜脚本 |

你也可以创建自己的自定义预设。

---

## 🔌 常见 API 服务

不知道去哪搞 API？这里列几个：

### OpenAI（官方）
- 注册：https://platform.openai.com
- API 地址：`https://api.openai.com/v1/chat/completions`
- 推荐模型：`gpt-4o-mini`（便宜够用）

### 其他兼容服务
只要是 **OpenAI 兼容格式** 的 API 都能用，比如：
- DeepSeek：`https://api.deepseek.com/v1/chat/completions`
- 各种国内中转站

> 💡 用什么服务不重要，关键是 API 地址和 Key 填对。

---

## 🗑️ 卸载

1. 双击运行 `uninstall.bat`
2. 输入 `Y` 确认
3. 重启 OpenCode

干干净净，不留垃圾文件。

---

## 📁 文件说明

看到这么多文件不用慌，了解一下就行：

```
plugins/
├── prompt-enhancer.ts    ← 插件主程序（拦截消息、调 API）
├── config.ts             ← 配置管理和内置预设
├── config-server.ts      ← 配置面板的后端服务
├── prompt-enhancer-config.json  ← 你的设置（自动生成）
├── install.bat           ← 安装脚本
├── uninstall.bat         ← 卸载脚本
├── start-gui.bat         ← 启动配置面板
├── gui/                  ← 配置面板的网页文件
│   ├── index.html
│   ├── style.css
│   └── app.js
└── README.md             ← 就是你在看的这个
```

---

## ❓ 常见问题

### 🙋 装了没效果？
1. 确认配置面板里**开关打开了**
2. 确认 API 地址、Key、模型都填了
3. 确认**重启过 OpenCode**

### 🙋 配置面板打不开？
- 如果提示没有 Bun / Node.js → 按脚本提示安装就行
- 如果端口被占 → 先关掉占端口的程序

### 🙋 API 报错？
- 检查 Key 是否过期或额度用完
- 检查 API 地址最后有没有 `/chat/completions`
- 试试换个模型名

### 🙋 想回到原版不优化？
在配置面板把开关关掉就行，不用卸载。
