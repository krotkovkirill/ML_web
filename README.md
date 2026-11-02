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
