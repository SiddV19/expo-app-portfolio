"""Training/inference cell from Siddharth Vadali's Google Colab project.

Run after the original notebook setup. This is a source excerpt, not a
standalone program: torch, DataLoader, TimeSeriesDataset, model, criterion,
optimizer, scaler_pred, and the NumPy input/target arrays must already exist.
"""

# Convert to Torch tensors
x_train = torch.from_numpy(x_train).float()
y_train = torch.from_numpy(y_train).float()
x_test = torch.from_numpy(x_test).float()
y_test = torch.from_numpy(y_test).float()

train_dataset = TimeSeriesDataset(x_train, y_train)
test_dataset = TimeSeriesDataset(x_test, y_test)

batch_size = 16
train_dataloader = DataLoader(train_dataset, batch_size=batch_size, shuffle=False)
test_dataloader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)

epochs = 50

for epoch in range(epochs):
    for x_batch, y_batch in train_dataloader:
        outputs = model(x_batch)
        loss = criterion(outputs, y_batch.unsqueeze(1))

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    print(f'Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}')

# Get the predicted values
y_pred_scaled = model(x_test)
y_pred_scaled_numpy = y_pred_scaled.detach().numpy()

# Unscale the predicted values
y_pred = scaler_pred.inverse_transform(y_pred_scaled_numpy)
y_test_unscaled = scaler_pred.inverse_transform(y_test.reshape(-1, 1))
