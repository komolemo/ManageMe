import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { useSettings, type AppLanguage } from "@/hooks/useSettings";
export type { AppLanguage } from "@/hooks/useSettings";

const resources = {
  en: {
    translation: {
      bucketStatus: {
        0: "Not Started", 50: "In Progress", 100: "Completed",
      },
      pages: {
        top: "TOP", search: "Search", searchResults: "Search Results",
        projects: "Projects", project: "Project", projectSettings: "Project Settings",
        library: "Library", document: "Document", taskDocument: "Task Document",
        tags: "Tags", tagSetting: "Tag Setting", dictionary: "Dictionary", settings: "Settings", common: "Common", results: "Results",
      },
      common: {
        new: "New", create: "Create", cancel: "Cancel", close: "Close", clear: "Clear",
        add: "Add", addTask: "Add Task", open: "Open", rename: "Rename", delete: "Delete",
        duplicate: "Duplicate", copyUrl: "Copy URL", copy: "Copy", copyLink: "Copy link",
        deleteTask: "Delete task", openInNewTab: "Open in a new tab", selectTask: "Select a task",
        back: "Back", next: "Next", previous: "Previous",
      },
      sort: {
        name: "Name", lastUpdated: "Last Updated", creationDate: "Creation Date", starred: "Starred",
        ascending: "Ascending", descending: "Descending", sort: "Sort", color: "Color",
        lastUsed: "Last Used", links: "Links", showing: "Showing", of: "of",
      },
      header: {
        search: "Search", settings: "Settings", unreadNotifications: "Unread notifications",
        notificationsUnread: "Notifications ({{count}} unread)", noSuggestions: "No suggestions found",
        clearSearch: "Clear search",
      },
      sidebar: {
        search: "Search", projects: "Projects", document: "Document",
        projectList: "Project list", library: "Library", dictionary: "Dictionary",
      },
      detailSidebar: {
        label: "Detail sidebar", openProject: "Open Project page", addIssue: "Add issue",
        addDocument: "Add document", filterIssues: "Filter issues", filterDocuments: "Filter documents",
        collapse: "Collapse Sidebar 2", expand: "Expand Sidebar 2", resize: "Resize detail sidebar",
      },
      workspace: {
        projects: "Projects", library: "Document",
        createProject: "Create Project", createLibrary: "Create Document",
        projectDescription: "Enter a name for the new project.",
        libraryDescription: "Enter a name for the new Document.",
        projectName: "Project name", libraryName: "Document name", copySuffix: "Copy",
        createEntity: "Create {{entity}}", entityName: "{{entity}} name", copyName: "{{itemName}} Copy",
        notYetRegistered: "Not yet registered.",
      },
      top: {
        greeting: "Hello! You're doing great today!", workspaceList: "Workspace List",
        projects: "Projects", library: "Library", sortedByDate: "Sorted by Date",
        tasks: "Tasks", documents: "Documents", openProject: "Open Project", openLibrary: "Open Library",
        today: "Today", yesterday: "Yesterday", daysAgo_one: "{{count}} day ago", daysAgo_other: "{{count}} days ago",
      },
      search: {
        prompt: "What are you looking for?",
        help: "Enter a keyword to quickly find Issues and Documents.", keyword: "Search keyword",
        placeholder: "Search Issues, Documents, and keywords", search: "Search", results: "Results",
        all: "All", issues: "Issues", issue: "Issue", document: "DOCUMENT", resultTitle: "Search results",
        matchedResults: "Results matching “{{query}}”", resultCount: "{{count}} results", noSuggestions: "No suggestions found",
      },
      project: {
        grid: "Grid", board: "Board", searchTasks: "Search tasks", searchPlaceholder: "Search task ...",
        grouping: "Grouping", groupingProgress: "Grouping: Progress", groupingBucket: "Grouping: Bucket",
        settings: "Project settings", collapseChildren: "Collapse child tasks", expandChildren: "Expand child tasks",
        collapseTask: "Collapse {{taskName}}", expandTask: "Expand {{taskName}}",
        addTaskTo: "Add task to {{taskStatus}}", moveColumn: "Move {{columnName}} column",
        dragColumn: "Drag to move {{columnName}} column",
      },
      columns: {
        finished: "IsFinished", taskKey: "Task Key", subject: "Subject", status: "Status",
        dueDate: "Due Date", priority: "Priority", documentPage: "Document Page", milestone: "Milestone",
      },
      task: {
        taskName: "Task name", subtaskName: "Subtask name", addTask: "Add task", addSubtask: "Add subtask",
        parentTask: "Parent task", subtasks: "Subtasks", existingSearch: "Existing task search",
        taskNameOrId: "task name or task ID", backToAdd: "Back to add existing task", openMenu: "Open task menu",
        tags: "Tags", bucket: "Bucket", priority: "Priority", milestone: "Milestone",
        startDate: "Start Date", dueDate: "Due Date", description: "Description",
        priorityValues: { Low: "Low", Medium: "Medium", High: "High", Emergency: "Emergency" },
      },
      projectSettings: {
        title: "Project Settings", bucket: "Bucket", milestone: "Milestone", addBucket: "Add bucket",
        addMilestone: "Add milestone", newBucketName: "New bucket name", newMilestoneName: "New milestone name",
        deleteBucket: "Delete bucket", deleteMilestone: "Delete milestone",
        dragBucket: "Drag {{bucketName}} bucket", dragMilestone: "Drag {{milestoneName}} milestone",
        confirmDeleteBucket: "Delete \"{{bucketName}}\" bucket?",
        confirmDeleteMilestone: "Delete \"{{milestoneName}}\" milestone?",
        moveBucketTasks: "Tasks in \"{{bucketName}}\" will be moved to \"{{fallbackBucketName}}\".",
        moveMilestoneTasks: "Tasks in \"{{milestoneName}}\" will be moved to \"{{fallbackMilestoneName}}\".",
      },
      document: {
        document: "Document", reference: "Reference", checklist: "Checklist", draft: "Draft",
        changeIcon: "Change document icon", untitled: "Untitled Document {{number}}",
        openMenu: "Open document menu for {{documentTitle}}",
      },
      editor: {
        commandBar: "Markdown command bar", editorMode: "Editor mode", text: "Text", markdown: "Markdown",
        selectHeading: "Select heading level", heading: "Heading", heading1: "Heading 1", heading2: "Heading 2",
        heading3: "Heading 3", bold: "Bold", italic: "Italic", blockQuote: "Block quote",
        codeBlock: "Code block", url: "URL", bulletedList: "Bulleted list", numberedList: "Numbered list",
        checkbox: "Checkbox", markdownInput: "Markdown input",
      },
      taskData: {
        showGrid: "Show subtasks as a grid", showBoard: "Show subtasks as a board view", title: "Task Data",
        bucket: "Bucket", priority: "Priority", milestone: "Milestone", startDate: "Start Date",
        dueDate: "Due Date", relationships: "Task relationships", subtasks: "Subtasks",
      },
      tags: {
        tags: "Tags", tag: "Tag", manager: "Tag Manager", input: "Tag input", searchTags: "Search tags",
        tagSearch: "Tag search", noneFound: "No tags found", noSuggestions: "No suggestions found",
        createTag: "Create tag", createHelp: "Enter a name for the new tag.", tagName: "Tag name",
        linkedSets: "Linked task & document sets", linkedDocuments: "Linked documents", task: "Task",
        document: "Document", scope: "Scope", tagColor: "Tag color", selectColor: "Select a color for this tag.",
        changeColor: "Change tag color", searchFor: "Search for {{tagName}}", unlink: "Unlink {{tagName}}",
        openMenu: "Open menu for {{tagName}}", deleteTitle: "Delete tag",
        deleteDescription: "Delete the tag \"{{tagName}}\"? This action cannot be undone.",
      },
      dictionary: {
        title: "Dictionary", help: "Manage terms and definitions used in ManageMe.",
        search: "Search terms", searchResults: "Search results", allTerms: "All terms", index: "Term index",
        count: "{{count}} terms", noneFound: "No terms found.", create: "Create term", edit: "Edit term",
        formHelp: "Enter the term details.", word: "Term", furigana: "Furigana",
        furiganaHelp: "Hiragana only. Leave blank for Latin terms.",
        furiganaError: "Furigana may contain hiragana characters only.",
        description: "Description",
        openMenu: "Open menu for {{word}}", deleteTitle: "Delete term",
        deleteDescription: "Delete the term \"{{word}}\"? It will be logically deleted.",
      },
      colors: {
        Red: "Red", Orange: "Orange", Yellow: "Yellow", Lime: "Lime", Green: "Green",
        "Light Blue": "Light Blue", Blue: "Blue", Navy: "Navy", Purple: "Purple", Pink: "Pink",
        White: "White", Gray: "Gray", Brown: "Brown", "Dark Gray": "Dark Gray",
      },
      settings: {
        theme: "Theme", themeMode: "Dark / Light Mode", zoom: "Zoom", fullscreen: "fullscreen",
        tagsManager: "Tags Manager", tagManager: "Tag Manager", language: "Language",
        systemDefault: "System default", japanese: "日本語", english: "English",
        appSettings: "App Settings", management: "Management", administration: "Administration", quickMenu: "Quick Menu",
        openSettings: "Open Settings", light: "Light", dark: "Dark", zoomIn: "Zoom in", zoomOut: "Zoom out",
      },
      ai: {
        sidebar: "AI chat sidebar", resize: "Resize AI chat", back: "Back from AI chat", close: "Close AI chat",
        message: "AI chat message", ask: "Ask AI", addAttachment: "Add chat attachment",
        send: "Send AI chat message", title: "AI Chat",
      },
      a11y: {
        breadcrumb: "Breadcrumb", openPages: "Open pages", newTab: "New tab", backTab: "Back tab page",
        forwardTab: "Forward tab page", primarySidebar: "Primary sidebar", subtaskProgress: "Sub-task progress",
        close: "Close", previousTagPage: "Previous tag page", nextTagPage: "Next tag page",
        star: "Star {{itemName}}", unstar: "Unstar {{itemName}}", itemActions: "{{itemName}} actions",
        editTitle: "Edit {{itemName}} title", itemTitle: "{{itemName}} title", closeTab: "Close {{tabTitle}}",
      },
    },
  },
  ja: {
    translation: {
      bucketStatus: {
        0: "未対応", 50: "進行中", 100: "完了",
      },
      pages: {
        top: "TOP", search: "検索", searchResults: "検索結果", projects: "プロジェクト", project: "プロジェクト",
        projectSettings: "プロジェクト設定", library: "ライブラリ", document: "ドキュメント",
        taskDocument: "タスクドキュメント", tags: "タグ", tagSetting: "タグ設定", settings: "設定",
        common: "共通", dictionary: "用語辞典", results: "結果",
      },
      common: {
        new: "新規", create: "作成", cancel: "キャンセル", close: "閉じる", clear: "クリア", add: "追加",
        addTask: "タスクを追加", open: "開く", rename: "名前を変更", delete: "削除", duplicate: "複製",
        copyUrl: "URLをコピー", copy: "コピー", copyLink: "リンクをコピー", deleteTask: "タスクを削除",
        openInNewTab: "新しいタブで開く", selectTask: "タスクを選択", back: "戻る", next: "次へ", previous: "前へ",
      },
      sort: {
        name: "名前", lastUpdated: "最終更新日", creationDate: "作成日", starred: "お気に入り",
        ascending: "昇順", descending: "降順", sort: "並び替え", color: "色", lastUsed: "最終使用日",
        links: "リンク", showing: "表示", of: "/",
      },
      header: {
        search: "検索", settings: "設定", unreadNotifications: "未読通知",
        notificationsUnread: "通知（未読{{count}}件）", noSuggestions: "候補がありません", clearSearch: "検索をクリア",
      },
      sidebar: {
        search: "検索", projects: "プロジェクト", document: "ライブラリ", library: "ライブラリ",
        projectList: "プロジェクト一覧", libraryList: "ライブラリ一覧", dictionary: "用語辞典",
      },
      detailSidebar: {
        label: "詳細サイドバー", openProject: "プロジェクトページを開く", addIssue: "課題を追加",
        addDocument: "ドキュメントを追加", filterIssues: "課題を絞り込む",
        filterDocuments: "ドキュメントを絞り込む", collapse: "サイドバー2を折りたたむ", expand: "サイドバー2を展開する", resize: "詳細サイドバーの幅を変更",
      },
      workspace: {
        projects: "プロジェクト", library: "ライブラリ",
        createProject: "プロジェクトを作成", createLibrary: "ライブラリを作成",
        projectDescription: "新しいプロジェクトの名前を入力してください。",
        libraryDescription: "新しいライブラリの名前を入力してください。",
        projectName: "プロジェクト名", libraryName: "ライブラリ名", copySuffix: "のコピー",
        createEntity: "{{entity}}を作成", entityName: "{{entity}}名", copyName: "{{itemName}}のコピー",
        notYetRegistered: "Not yet registered.",
      },
      top: {
        greeting: "こんにちは！今日も頑張っていますね！", workspaceList: "ワークスペース一覧",
        projects: "プロジェクト", library: "ライブラリ", sortedByDate: "日付順",
        tasks: "課題", documents: "文書", openProject: "プロジェクトを開く", openLibrary: "ライブラリを開く",
        today: "今日", yesterday: "昨日",
        daysAgo: "{{count}}日前",
      },
      search: {
        prompt: "何を探しますか？", help: "キーワードを入力して、IssueやDocumentをすばやく見つけます。",
        keyword: "検索キーワード", placeholder: "Issue、Document、キーワードを検索", search: "検索", results: "結果",
        all: "すべて", issues: "Issue", issue: "Issue", document: "DOCUMENT", resultTitle: "検索結果",
        matchedResults: "「{{query}}」に一致する結果", resultCount: "{{count}}件", noSuggestions: "候補がありません",
      },
      project: {
        grid: "グリッド", board: "ボード", searchTasks: "タスクを検索", searchPlaceholder: "タスクを検索 ...",
        grouping: "グループ化", groupingProgress: "グループ化：進捗", groupingBucket: "グループ化：バケット",
        settings: "プロジェクト設定", collapseChildren: "子タスクを折りたたむ", expandChildren: "子タスクを展開する",
        collapseTask: "{{taskName}}を折りたたむ", expandTask: "{{taskName}}を展開する",
        addTaskTo: "{{taskStatus}}にタスクを追加", moveColumn: "{{columnName}}列を移動",
        dragColumn: "ドラッグして{{columnName}}列を移動",
      },
      columns: {
        finished: "完了", taskKey: "タスクキー", subject: "件名", status: "ステータス", dueDate: "期限",
        priority: "優先度", documentPage: "ドキュメントページ", milestone: "マイルストーン",
      },
      task: {
        taskName: "タスク名", subtaskName: "サブタスク名", addTask: "タスクを追加", addSubtask: "サブタスクを追加",
        parentTask: "親タスク", subtasks: "サブタスク", existingSearch: "既存タスクを検索",
        taskNameOrId: "タスク名またはタスクID", backToAdd: "既存タスクの追加に戻る", openMenu: "タスクメニューを開く",
        tags: "タグ", bucket: "バケット", priority: "優先度", milestone: "マイルストーン",
        startDate: "開始日", dueDate: "期限", description: "説明",
        priorityValues: { Low: "低", Medium: "中", High: "高", Emergency: "緊急" },
      },
      projectSettings: {
        title: "プロジェクト設定", bucket: "バケット", milestone: "マイルストーン", addBucket: "バケットを追加",
        addMilestone: "マイルストーンを追加", newBucketName: "新しいバケット名",
        newMilestoneName: "新しいマイルストーン名", deleteBucket: "バケットを削除",
        deleteMilestone: "マイルストーンを削除", dragBucket: "{{bucketName}}バケットをドラッグ",
        dragMilestone: "{{milestoneName}}マイルストーンをドラッグ",
        confirmDeleteBucket: "バケット「{{bucketName}}」を削除しますか？",
        confirmDeleteMilestone: "マイルストーン「{{milestoneName}}」を削除しますか？",
        moveBucketTasks: "「{{bucketName}}」のタスクを「{{fallbackBucketName}}」へ移動します。",
        moveMilestoneTasks: "「{{milestoneName}}」のタスクを「{{fallbackMilestoneName}}」へ移動します。",
      },
      document: {
        document: "ドキュメント", reference: "参考資料", checklist: "チェックリスト", draft: "下書き",
        changeIcon: "ドキュメントのアイコンを変更", untitled: "無題のドキュメント {{number}}",
        openMenu: "{{documentTitle}}のドキュメントメニューを開く",
      },
      editor: {
        commandBar: "Markdownコマンドバー", editorMode: "エディターモード", text: "テキスト", markdown: "Markdown",
        selectHeading: "見出しレベルを選択", heading: "見出し", heading1: "見出し1", heading2: "見出し2",
        heading3: "見出し3", bold: "太字", italic: "斜体", blockQuote: "引用", codeBlock: "コードブロック",
        url: "URL", bulletedList: "箇条書き", numberedList: "番号付きリスト", checkbox: "チェックボックス",
        markdownInput: "Markdown入力",
      },
      taskData: {
        showGrid: "サブタスクをグリッドで表示", showBoard: "サブタスクをボードで表示", title: "タスクデータ",
        bucket: "バケット", priority: "優先度", milestone: "マイルストーン", startDate: "開始日",
        dueDate: "期限", relationships: "タスクの関連", subtasks: "サブタスク",
      },
      tags: {
        tags: "タグ", tag: "タグ", manager: "タグ管理", input: "タグ入力", searchTags: "タグを検索",
        tagSearch: "タグ検索", noneFound: "タグが見つかりません", noSuggestions: "候補がありません",
        createTag: "タグを作成", createHelp: "新しいタグの名前を入力してください。", tagName: "タグ名",
        linkedSets: "リンクされたタスクとドキュメントの組", linkedDocuments: "リンクされたドキュメント",
        task: "タスク", document: "ドキュメント", scope: "範囲", tagColor: "タグの色",
        selectColor: "このタグの色を選択してください。", changeColor: "タグの色を変更",
        searchFor: "{{tagName}}を検索", unlink: "{{tagName}}のリンクを解除",
        openMenu: "「{{tagName}}」のメニューを開く", deleteTitle: "タグを削除",
        deleteDescription: "タグ「{{tagName}}」を削除しますか？この操作は取り消せません。",
      },
      dictionary: {
        title: "用語辞典", help: "ManageMeで使用する用語と説明を管理します。",
        search: "用語を検索", searchResults: "検索結果", allTerms: "すべての用語", index: "用語の索引",
        count: "{{count}}件", noneFound: "用語が登録されていません。", create: "用語を登録", edit: "用語を編集",
        formHelp: "用語の情報を入力してください。", word: "用語", furigana: "ふりがな",
        furiganaHelp: "ひらがなのみ入力できます。英字の用語では空欄にできます。",
        furiganaError: "ふりがなには、ひらがなのみ入力してください。",
        description: "説明",
        openMenu: "{{word}}のメニューを開く", deleteTitle: "用語を削除",
        deleteDescription: "用語「{{word}}」を削除しますか？",
      },
      colors: {
        Red: "赤", Orange: "オレンジ", Yellow: "黄", Lime: "ライム", Green: "緑",
        "Light Blue": "水色", Blue: "青", Navy: "紺", Purple: "紫", Pink: "ピンク",
        White: "白", Gray: "グレー", Brown: "茶", "Dark Gray": "ダークグレー",
      },
      settings: {
        theme: "テーマ", themeMode: "ダーク／ライトモード", zoom: "ズーム", fullscreen: "全画面表示",
        tagsManager: "タグ管理", tagManager: "タグ管理", language: "言語", systemDefault: "システム設定",
        japanese: "日本語", english: "English",
        appSettings: "アプリ設定", management: "管理", administration: "管理", quickMenu: "クイックメニュー",
        openSettings: "設定を開く", light: "ライト", dark: "ダーク", zoomIn: "拡大", zoomOut: "縮小",
      },
      ai: {
        sidebar: "AIチャットサイドバー", resize: "AIチャットのサイズを変更", back: "AIチャットから戻る",
        close: "AIチャットを閉じる", message: "AIチャットメッセージ", ask: "AIに質問",
        addAttachment: "添付ファイルを追加", send: "AIチャットメッセージを送信", title: "AIチャット",
      },
      a11y: {
        breadcrumb: "パンくず", openPages: "開いているページ", newTab: "新しいタブ", backTab: "前のタブページへ戻る",
        forwardTab: "次のタブページへ進む", primarySidebar: "メインサイドバー", subtaskProgress: "サブタスクの進捗",
        close: "閉じる", previousTagPage: "前のタグページ", nextTagPage: "次のタグページ",
        star: "{{itemName}}をお気に入りに追加", unstar: "{{itemName}}をお気に入りから解除",
        itemActions: "{{itemName}}の操作", editTitle: "{{itemName}}のタイトルを編集",
        itemTitle: "{{itemName}}のタイトル", closeTab: "{{tabTitle}}を閉じる",
      },
    },
  },
} as const;

function systemLanguage(): "en" | "ja" {
  const preferredLanguage = navigator.languages
    .map((language) => language.toLowerCase().split("-")[0])
    .find((language) => language === "en" || language === "ja");

  return preferredLanguage === "ja" ? "ja" : "en";
}

export function getLanguagePreference(): AppLanguage {
  return useSettings.getState().language;
}

export function resolveLanguage(preference: AppLanguage): "en" | "ja" {
  return preference === "system" ? systemLanguage() : preference;
}

const initialLanguage = resolveLanguage(getLanguagePreference());

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

document.documentElement.lang = initialLanguage;
i18n.on("languageChanged", (language) => {
  document.documentElement.lang = language;
});
window.addEventListener("languagechange", () => {
  if (getLanguagePreference() === "system") {
    void i18n.changeLanguage(systemLanguage());
  }
});

export default i18n;
