// SPDX-License-Identifier: MIT

export default {
  app: {
    intro: "ローカル資料検索と引用支援。",
    subtitle: "影響範囲調査ワークスペース",
    title: "ZeroTraceSource"
  },
  dialog: {
    buttons: {
      cancel: "キャンセル",
      confirm: "確認",
      ok: "OK"
    },
    title: {
      confirm: "確認",
      error: "操作に失敗しました",
      warning: "警告"
    }
  },
  page: {
    actions: {
      add: "追加",
      copyCommand: "コマンドをコピー",
      run: "検索開始",
      running: "検索中",
      saveConditions: "保存",
      saving: "保存中"
    },
    ai: {
      add: "追加",
      changeText: "顧客の変更内容",
      generated: (count) => `${count} 件の候補キーワードを生成しました。`,
      generate: "候補キーワードを生成",
      generating: "生成中",
      placeholder: "例：安全方針の表示文言を変更し、承認状態によって制御を変える。",
      ready: "候補は自動追加されません。手動で確認してください。",
      requireText: "顧客の変更内容を入力してください。",
      subtitle: "まず候補キーワードだけを生成し、確認後に追加します。",
      title: "AI 支援"
    },
    commandPreview: "PowerShell コマンドプレビュー",
    conditions: {
      subtitle: "現場調査に必要な最小限の条件を入力します。",
      title: "調査条件"
    },
    fields: {
      case: "大小文字",
      caseSensitive: "大小文字を区別",
      contextLines: "前後行数",
      excludes: "この文字を含むパスを除外",
      extensions: "検索対象拡張子（任意）",
      keywords: "キーワード",
      outputDir: "出力フォルダ",
      outputPrefix: "ファイル接頭辞",
      roots: "検索フォルダ",
      title: "調査タイトル"
    },
    metrics: {
      keywords: "キーワード",
      output: "出力形式",
      roots: "検索フォルダ"
    },
    placeholders: {
      exclude: "例 old、backup、退避、検証用",
      keyword: "キーワードを入力。複数行の貼り付けも可能です",
      root: "仕様書、コード、その他の検索フォルダを入力"
    },
    reportSheets: "レポートシート",
    result: {
      errors: "エラー",
      excelFiles: "Excel ファイル",
      matches: "ヒット件数",
      textFiles: "テキストファイル",
      title: "実行結果"
    },
    run: {
      subtitle: "ローカル Python Web サービス経由で検索エンジンを呼び出します。",
      title: "検索実行"
    },
    status: {
      copied: "コマンドをコピーしました。",
      copyFailed: "コピーに失敗しました。コマンド文字列を手動で選択してください。",
      ready: "条件を入力して検索を開始してください。コマンドプレビューは確認用です。",
      runFailed: "検索に失敗しました。ローカル Web サービスが起動しているか確認してください。",
      running: "検索中です。しばらくお待ちください。",
      conditionsSaved: "調査条件を保存しました。",
      saveConditionsFailed: "調査条件の保存に失敗しました。",
      savingConditions: "調査条件を保存しています。",
      success: "検索が完了し、レポートを生成しました。"
    }
  }
};
