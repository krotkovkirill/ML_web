# ML_web

Интерактивный курс машинного обучения: 18 уроков, вопросы и задачи,
лаборатория, scikit-learn и PyTorch. Адаптивный интерфейс, прогресс в браузере.

## Запуск

Открой `index.html` или выполни `python3 start.py`.
На macOS можно запустить `Запустить сайт.command`.

## Python-практика

Python 3.10+:

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r practice/requirements.txt
python practice/01_sklearn_iris.py
python practice/02_pytorch_iris.py
```

На Windows: `.venv\Scripts\activate` вместо `source`.
Практикумы работают на CPU; результаты сохраняются в `practice/outputs/`.

## Задачи с кодом

18 упражнений в разделе «Задачи с кодом»: 6 функций на Python с проверкой на нескольких входах и 12 упражнений на вызовы sklearn/PyTorch. Во втором режиме проверяется Python AST, библиотеки не запускаются. Черновики и прогресс хранятся локально в браузере.

Python работает через Pyodide 0.27.7 в отдельном Web Worker. Первый запуск требует доступа к cdn.jsdelivr.net. Есть остановка, лимит выполнения 5 секунд и ограничение вывода. Сервер не выполняет пользовательский код.

Проверки: `node check-coding.cjs` (нужен также `python3`).
