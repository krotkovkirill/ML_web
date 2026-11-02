"""Практикум 1: честное сравнение моделей на Iris. Запуск: python practice/01_sklearn_iris.py
Задания: 1) объясни форму X; 2) добавь C=0.1 и C=10; 3) сравни CV,
не используя test для выбора; 4) объясни ошибки в confusion matrix.
"""
from pathlib import Path
import joblib
from sklearn.datasets import load_iris
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler


def main():
    data = load_iris()
    X, y = data.data, data.target
    print('Объекты и признаки:', X.shape, '\nПризнаки:', data.feature_names)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42)
    candidates = {
        'baseline': DummyClassifier(strategy='most_frequent'),
        'logistic': make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
        'forest': RandomForestClassifier(n_estimators=100, random_state=42),
    }
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = {}
    for name, candidate in candidates.items():
        fold_scores = cross_val_score(candidate, X_train, y_train, cv=cv, scoring='f1_macro')
        scores[name] = fold_scores.mean()
        print(f'{name}: CV F1 macro = {scores[name]:.3f} ± {fold_scores.std():.3f}')
    best_name = max(scores, key=scores.get)
    model = candidates[best_name]
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    print('\nВыбрана по CV:', best_name)
    print('Финальная оценка test:')
    print(classification_report(y_test, pred, target_names=data.target_names, zero_division=0))
    print('Confusion matrix:\n', confusion_matrix(y_test, pred))
    output = Path(__file__).resolve().parent / 'outputs'
    output.mkdir(exist_ok=True)
    joblib.dump({'model': model, 'features': data.feature_names,
                 'classes': data.target_names}, output / 'iris_sklearn.joblib')
    print('Модель сохранена:', output / 'iris_sklearn.joblib')


if __name__ == '__main__':
    main()
