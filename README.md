# 法语拼读训练台

一个面向中文学习者的交互式法语学习网站，重点解决法语单词拼写、读音记忆和拼读规则训练的痛点。

## 在线访问

[https://french-pronunciation-lab.shaotianxiao1013.chatgpt.site](https://french-pronunciation-lab.shaotianxiao1013.chatgpt.site)

## 功能

- 听音拼写
- 看词预测 IPA 读音
- 音素-字母映射
- 高频拼写规则训练
- 法语特殊字母软键盘
- 错词本
- 间隔复习
- 词根 / 词族关联
- 动词变位训练
- 难度和掌握度追踪
- 分级词库浏览，支持 A1 / A2 / B1 / B2 筛选

## 词库设计

当前 MVP 使用示例词库展示完整训练闭环。数据结构已预留开放词库导入接口，后续可以接入 Lexique、Wiktionary dump、开放 TTS / 发音音频索引和词频数据。项目目标是支持超大规模开放法语词库，而不是复制受版权保护的商业词典。

## 本地运行

```bash
npm install
npm run dev
```

构建检查：

```bash
npm run build
```
