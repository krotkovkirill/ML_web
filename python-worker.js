importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');
self.onmessage = async ({data}) => {
 try {
  const py = await loadPyodide();
  py.globals.set('payload_json', JSON.stringify(data));
  self.postMessage({ready:true});
  const result = await py.runPythonAsync(`
import ast, contextlib, io, json, math, traceback
payload = json.loads(payload_json)
passed = False
output = ''
try:
    if payload['mode'] == 'line':
        actual = ast.dump(ast.parse(payload['code']))
        passed = any(actual == ast.dump(ast.parse(s)) for s in payload['solutions'])
        output = ('✓ Строка верна. Синтаксис и нужный вызов совпадают с условием.' if passed else 'Пока не подходит. Проверь метод, аргументы и имена переменных. Открой подсказку, если застрял.')
        output += '\\nБиблиотека не запускалась: это проверка структуры строки.'
    else:
        class LimitedOutput(io.StringIO):
            def write(self, text):
                if self.tell() + len(text) > 12000:
                    raise RuntimeError('Слишком много вывода. Убери лишние print или проверь цикл.')
                return super().write(text)
        stream = LimitedOutput()
        namespace = {'__name__': '__main__'}
        with contextlib.redirect_stdout(stream), contextlib.redirect_stderr(stream):
            exec(compile(payload['code'], 'practice.py', 'exec'), namespace)
        checks = []
        passed = True
        for expression, expected in payload['tests']:
            with contextlib.redirect_stdout(stream), contextlib.redirect_stderr(stream):
                actual = eval(expression, namespace)
            ok = isinstance(actual, (int, float)) and not isinstance(actual, bool) and math.isclose(actual, expected, rel_tol=1e-7, abs_tol=1e-7)
            passed = passed and ok
            checks.append(('✓ ' if ok else '✗ ') + expression + ': ожидалось ' + repr(expected) + ', получено ' + repr(actual)[:200])
        output = ('Вывод программы:\\n' + stream.getvalue() + '\\n' if stream.getvalue() else '') + '\\n'.join(checks)
        output += '\\n\\n' + ('Все 3 проверки пройдены. Отличная работа!' if passed else 'Исправь функцию и попробуй ещё раз.')
except Exception as error:
    passed = False
    tips = {'SyntaxError': 'Проверь двоеточия, скобки и запись выражения.', 'IndentationError': 'Внутри функции нужен отступ — обычно 4 пробела.', 'NameError': 'Имя не определено. Замени ___ и проверь написание переменных.', 'ZeroDivisionError': 'Делитель равен нулю. Проверь порядок числителя и знаменателя.', 'TypeError': 'Проверь типы значений и аргументы функции.'}
    output = ''.join(traceback.format_exception_only(type(error), error)) + '\\n' + tips.get(type(error).__name__, 'Проверь строку с ошибкой и условие задачи.')
json.dumps({'passed': passed, 'output': output}, ensure_ascii=False)
`);
  self.postMessage(JSON.parse(result));
 } catch(error) { self.postMessage({passed:false,output:'Не удалось выполнить проверку: '+String(error).slice(0,1500)}); }
};
