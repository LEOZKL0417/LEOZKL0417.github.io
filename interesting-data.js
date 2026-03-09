window.interestingItems = [
  {
    id: "reasoning-with-retrieval-paper",
    type: "paper",
    tag: "RAG",
    date: "2026-03-08",
    title: "Reasoning with Retrieval-Augmented Generation",
    source: "arXiv",
    sourceUrl: "https://arxiv.org/",
    summary:
      "文章讨论了在推理流程中融合检索模块的方式，重点分析了检索时机、上下文拼接策略和结果可解释性。",
    thoughts:
      "我最关心的是它把“何时检索”当作决策问题，不是固定步骤。这个思路可以迁移到我的问答系统里。下一步想试一下多轮对话里的动态检索开关。",
  },
  {
    id: "agentic-workflow-video",
    type: "video",
    tag: "Agent",
    date: "2026-03-06",
    title: "Building Reliable Agentic Workflows",
    source: "YouTube",
    sourceUrl: "https://www.youtube.com/",
    summary:
      "视频给了一套可落地的 Agent 工作流设计：任务分解、工具调用、失败回退、可观测性记录。",
    thoughts:
      "对我启发最大的是把失败路径设计成一等公民。以前我更多关注 happy path，之后会把错误分类和重试策略提前设计。",
  },
  {
    id: "evaluation-design-note",
    type: "note",
    tag: "Evaluation",
    date: "2026-03-04",
    title: "LLM 应用评测指标设计",
    source: "Personal Note",
    sourceUrl: "#",
    summary:
      "这条是我自己的笔记，整理了离线评测与在线评测的连接方式，包括准确率、覆盖率、响应稳定性等指标。",
    thoughts:
      "我准备把评测从“单次打分”改成“持续回归”，每次改 Prompt 或策略都自动比较历史基线，避免体感变好但指标下降。",
  },
];
