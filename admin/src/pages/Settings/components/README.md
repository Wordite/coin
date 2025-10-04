# Settings Components

Компоненты для управления настройками в админке.

## Структура

```
components/
├── VaultStatus/           # Статус подключения к Vault
├── WalletStatus/          # Статус инициализации кошелька
├── WalletActions/         # Действия с кошельком (инициализация, обновление, удаление)
├── WalletInfo/            # Информация о кошельке (время обновления)
├── RootWalletManagement/  # Основной компонент управления root кошельком
└── index.ts              # Экспорт всех компонентов
```

## Компоненты

### VaultStatus
Отображает статус подключения к Vault с возможностью обновления.

**Props:**
- `isConnected: boolean` - статус подключения
- `error?: string` - ошибка подключения
- `onRefresh: () => void` - функция обновления статуса
- `loading: boolean` - состояние загрузки

### WalletStatus
Отображает статус инициализации кошелька.

**Props:**
- `isInitialized: boolean` - статус инициализации

### WalletActions
Кнопки действий с кошельком в зависимости от статуса.

**Props:**
- `isInitialized: boolean` - статус инициализации
- `onInitialize: () => void` - функция инициализации
- `onUpdate: () => void` - функция обновления
- `onDelete: () => void` - функция удаления
- `loading: boolean` - состояние загрузки

### WalletInfo
Отображает информацию о кошельке (время последнего обновления).

**Props:**
- `updatedAt?: string` - время последнего обновления

### RootWalletManagement
Основной компонент, объединяющий все остальные компоненты.

**Props:**
- `vaultStatus` - статус Vault
- `walletInfo` - информация о кошельке
- `onVaultRefresh` - функция обновления Vault
- `onInitialize` - функция инициализации
- `onUpdate` - функция обновления
- `onDelete` - функция удаления
- `loading` - состояние загрузки

## Использование

```tsx
import { RootWalletManagement } from './components'

<RootWalletManagement
  vaultStatus={vaultStatus}
  walletInfo={walletInfo}
  onVaultRefresh={checkVaultStatus}
  onInitialize={onOpen}
  onUpdate={onOpen}
  onDelete={onDeleteOpen}
  loading={vaultLoading}
/>
```
