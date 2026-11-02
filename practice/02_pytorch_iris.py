"""Практикум 2: нейросеть с validation и независимым test.
Задания: попробуй hidden=8/16/32, сравни validation loss; объясни zero_grad,
backward, step; используй test только для выбранного решения.
"""
from copy import deepcopy
from pathlib import Path
import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.datasets import load_iris
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


def main():
    torch.manual_seed(42)
    torch.set_num_threads(1)
    data = load_iris()
    X_dev, X_test, y_dev, y_test = train_test_split(
        data.data, data.target, test_size=0.2, stratify=data.target, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(
        X_dev, y_dev, test_size=0.25, stratify=y_dev, random_state=42)
    scaler = StandardScaler().fit(X_train)

    def features(X):
        return torch.tensor(scaler.transform(X), dtype=torch.float32)

    xt, xv, xs = map(features, (X_train, X_val, X_test))
    yt, yv = (torch.tensor(y, dtype=torch.long) for y in (y_train, y_val))
    loader = DataLoader(TensorDataset(xt, yt), batch_size=16, shuffle=True,
                        generator=torch.Generator().manual_seed(42))
    hidden = 16
    model = nn.Sequential(nn.Linear(4, hidden), nn.ReLU(), nn.Linear(hidden, 3))
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    criterion = nn.CrossEntropyLoss()
    best_loss = float('inf')
    best_state = deepcopy(model.state_dict())
    best_epoch = 0
    for epoch in range(100):
        model.train()
        total_loss = 0.0
        for xb, yb in loader:
            optimizer.zero_grad()
            loss = criterion(model(xb), yb)
            loss.backward()
            optimizer.step()
            total_loss += loss.item() * len(xb)
        model.eval()
        with torch.no_grad():
            val_loss = criterion(model(xv), yv).item()
        if val_loss < best_loss:
            best_loss, best_state, best_epoch = val_loss, deepcopy(model.state_dict()), epoch + 1
        if (epoch + 1) % 10 == 0:
            print(f'Epoch {epoch + 1}: train={total_loss / len(xt):.4f}, val={val_loss:.4f}')
    model.load_state_dict(best_state)
    model.eval()
    with torch.no_grad():
        pred = model(xs).argmax(dim=1).numpy()
    print(f'Лучшая эпоха: {best_epoch}, validation loss: {best_loss:.4f}')
    print('Финальная оценка test:')
    print(classification_report(y_test, pred, target_names=data.target_names, zero_division=0))
    output = Path(__file__).resolve().parent / 'outputs'
    output.mkdir(exist_ok=True)
    torch.save({'state_dict': best_state, 'hidden': hidden,
                'scaler_mean': torch.tensor(scaler.mean_),
                'scaler_scale': torch.tensor(scaler.scale_),
                'classes': data.target_names.tolist(), 'features': data.feature_names},
               output / 'iris_pytorch.pt')
    # Для восстановления: checkpoint = torch.load(path, weights_only=True)
    # Создай ту же сеть по hidden и загрузи checkpoint['state_dict'].
    # Новые признаки: (X - scaler_mean) / scaler_scale; затем float32.
    print('Веса и подготовка сохранены:', output / 'iris_pytorch.pt')


if __name__ == '__main__':
    main()
