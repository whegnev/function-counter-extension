import * as vscode from 'vscode';

function analyzeCode(text: string, language: string): { functions: number, ifs: number, loops: number } {
 /**
 * Анализирует исходный код и подсчитывает количество функций, операторов if и циклов
 * для различных языков программирования
 * 
 * Параметры на вход:
 * text - Исходный код для анализа
 * language - Идентификатор языка программирования
 * 
 * Вывод:
 * Объект со статистикой, содержащий количество функций, операторов if и циклов
 * 
 * Пример:
 * text: function test() { if (true) { } }
 * language: javascript
 * Результат:
 * functions: 1, ifs: 1, loops: 0
 */
    let functionCount = 0;
    let ifCount = 0;
    let loopCount = 0;

    switch (language) {
        case 'javascript':
        case 'typescript':
            functionCount = (text.match(/\bfunction\s+\w+\s*\(/g) || []).length;
            ifCount = (text.match(/\bif\s*\(/g) || []).length;
            loopCount = (text.match(/\b(for|while)\s*\(/g) || []).length;
            break;

        case 'python':
            functionCount = (text.match(/\bdef\s+\w+\s*\(/g) || []).length;
            ifCount = (text.match(/\bif\s+[^:]*:/g) || []).length;
            loopCount = (text.match(/\b(for|while)\s+[^:]*:/g) || []).length;
            break;

        case 'java':
        case 'csharp':
        case 'cpp':
        case 'c':
            functionCount = (text.match(/\b\w+\s+\w+\s*\([^)]*\)\s*\{/g) || []).length;
            ifCount = (text.match(/\bif\s*\(/g) || []).length;
            loopCount = (text.match(/\b(for|while)\s*\(/g) || []).length;
            break;
    }

    return {
        functions: functionCount,
        ifs: ifCount,
        loops: loopCount
    };
}

function showStatsNotification() {
/**
 * Функция предназначена для ручного вызова пользователем через Command Palette
 * как альтернатива постоянному отображению статистики в статус-баре
 * 
 * Функция проверяет наличие активного текстового редактора в VS Code, извлекает текст и определяет язык программирования из активного документаб
 * анализирует код с помощью функции analyzeCode для подсчета конструкций и отображает результаты в виде всплывающего уведомления
 * 
 * Пример:
 * Вызывается при выполнении команды "Show Code Statistics" showStatsNotification();
 * Вывод: "Code Statistics: 3 functions, 2 if statements, 1 loops"
 */
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        vscode.window.showInformationMessage('No active code file found');
        return;
    }

    const text = editor.document.getText();
    const language = editor.document.languageId;
    const stats = analyzeCode(text, language);

    vscode.window.showInformationMessage(
        `Code Statistics: ${stats.functions} functions, ${stats.ifs} if statements, ${stats.loops} loops`
    );
}


export function activate(context: vscode.ExtensionContext) {
/**
 * Активирует расширение при его загрузке в VS Code, создает статус-бар, 
 * выполняет подписку на события изменения активного редактора и документа, деактивирует 
 * расширение при выгрузке из VS Code
 * 
 * Параметры:
 * context - Контекст расширения, предоставляемый VS Code, используется для управления 
 *          состоянием расширения и подписки на события
 *                     
 */
    console.log('Function Counter Extension activated!');

    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.show();
    const updateStatusBar = () => {
    /**
     * Обновляет текст в статус-баре на основе анализа текущего активного документа,
     * вызывается при событиях изменения документа или смены активного редактора.
     * Извлекает текст, определяет язык программирования и отображает статистику
     * в формате: [язык] Ф: _ | If: _ | Циклы: _
     */
		const editor = vscode.window.activeTextEditor;
		
		if (!editor) {
			statusBarItem.text = "Статистика: нет активного файла";
			return;
		}

		const text = editor.document.getText();
		const language = editor.document.languageId;
		const stats = analyzeCode(text, language);

		statusBarItem.text = `[${language}] Функции: ${stats.functions} | If: ${stats.ifs} | Циклы: ${stats.loops}`;
	};

    let showStatsCommand = vscode.commands.registerCommand('function-counter-extension.showStats', () => {
        showStatsNotification();
    });

    let refreshStatsCommand = vscode.commands.registerCommand('function-counter-extension.refreshStats', () => {
        updateStatusBar();
        vscode.window.showInformationMessage('Code statistics refreshed!');
    });

    context.subscriptions.push(
        statusBarItem,
        vscode.window.onDidChangeActiveTextEditor(updateStatusBar),
        vscode.workspace.onDidChangeTextDocument(updateStatusBar),
        showStatsCommand,
        refreshStatsCommand
    );

    updateStatusBar();
}

export function deactivate() {}
/**
 * Деактивирует расиширение при закрытии VS Code: удаляет созданные элементы и отписывается от событий
 */