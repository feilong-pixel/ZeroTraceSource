// SPDX-License-Identifier: MIT

export default {
  app: {
    intro: "本地资料搜索与引用支援。",
    subtitle: "影响范围调查工作台",
    title: "ZeroTraceSource"
  },
  dialog: {
    buttons: {
      cancel: "取消",
      confirm: "确认",
      ok: "确定"
    },
    title: {
      confirm: "确认操作",
      error: "操作失败",
      warning: "警告"
    }
  },
  page: {
    actions: {
      add: "追加",
      copyCommand: "复制命令",
      run: "开始搜索",
      running: "搜索中",
      saveConditions: "保存",
      saving: "保存中"
    },
    ai: {
      add: "追加",
      changeText: "客户变更内容",
      generated: (count) => `生成了 ${count} 个候选关键词。`,
      generate: "生成关键词候选",
      generating: "生成中",
      placeholder: "例如：修改安全方针的显示文案，并根据承认状态控制处理逻辑。",
      ready: "候选词不会自动加入，需要手动确认。",
      requireText: "请输入客户变更内容。",
      subtitle: "先只生成关键词候选，用户确认后再加入。",
      title: "AI 辅助"
    },
    commandPreview: "PowerShell 命令预览",
    conditions: {
      subtitle: "输入现场调查所需的最小参数。",
      title: "调查条件"
    },
    fields: {
      case: "大小写",
      caseSensitive: "区分大小写",
      contextLines: "上下文行数",
      excludes: "不搜索包含这些字符的路径",
      extensions: "只搜索这些扩展名（可选）",
      keywords: "关键词",
      outputDir: "输出目录",
      outputPrefix: "文件前缀",
      roots: "搜索目录",
      title: "调查标题"
    },
    metrics: {
      keywords: "关键词",
      output: "输出格式",
      roots: "搜索目录"
    },
    placeholders: {
      exclude: "例如 old、backup、退避、検証用",
      keyword: "输入关键词，支持粘贴多行",
      root: "输入式样目录、代码目录或其它搜索目录"
    },
    reportSheets: "报告 Sheet",
    result: {
      errors: "错误",
      excelFiles: "Excel 文件",
      matches: "命中结果",
      textFiles: "文本文件",
      title: "运行结果"
    },
    run: {
      subtitle: "通过本地 Python Web 服务调用搜索引擎。",
      title: "执行命令"
    },
    status: {
      copied: "命令已复制。",
      copyFailed: "复制失败，请手动选择命令文本。",
      ready: "填写条件后点击开始搜索。命令预览保留用于核对。",
      runFailed: "搜索失败。请确认本地 Web 服务已经启动。",
      running: "搜索中，请稍候。",
      conditionsSaved: "调查条件已保存。",
      saveConditionsFailed: "调查条件保存失败。",
      savingConditions: "正在保存调查条件。",
      success: "搜索完成，报告已生成。"
    }
  }
};
