<!-- 7d8b7874-3841-4eb2-a5d9-2dd86c649c8c 018fb6e4-69a8-48d8-a46b-f1a81be6923e -->
# Presale Management Logic Updates

## Changes Overview

Update the presale management UI and backend logic to properly track and display:

- **Pending Tokens**: Sum of successful but unreceived transactions
- **Coins Received**: Sum of received coins per user
- **Issue Tokens**: Enable only for users with pending tokens

## Backend Changes

### 1. Update User Statistics Calculation

**File**: `backend/src/user/user.service.ts`

- In `getUsersStatistics()` method (lines 658-705):
  - Change `totalCoinsPurchased` calculation to only count successful unreceived transactions
  - Add logic to filter transactions: `isSuccessful: true` AND `isReceived: false`
```typescript
// Current line 691:
totalCoinsPurchased += userStats.totalCoinsPurchased

// Change to calculate pending tokens:
const pendingTokens = userStats.transactions
  .filter(tx => tx.isSuccessful && !tx.isReceived)
  .reduce((sum, tx) => sum + tx.coinsPurchased, 0)
totalCoinsPurchased += pendingTokens
```

- Update return type to include `totalPendingTokens` instead of or alongside `totalCoinsPurchased`

### 2. Add User Pending Tokens Field

**File**: `backend/src/user/user.service.ts`

- In `UserWithTransactions` interface (lines 26-38):
  - Add `totalPendingTokens: number` field

- In `calculateUserStats()` method (lines 537-580):
  - After line 565, add calculation for pending tokens:
```typescript
const totalPendingTokens = transactions
  .filter(tx => tx.isSuccessful && !tx.isReceived)
  .reduce((sum, tx) => sum + tx.coinsPurchased, 0)
```

- Return `totalPendingTokens` in the return object (line 567-579)

## Frontend Changes

### 3. Update Presale Page UI

**File**: `admin/src/pages/Presale/index.tsx`

#### A. Update Table Column Header (line 325)

```typescript
// Change from:
<TableColumn>STATUS</TableColumn>

// To:
<TableColumn>COINS RECEIVED</TableColumn>
```

#### B. Update Table Cell Content (lines 357-365)

```typescript
// Replace the STATUS cell with:
<TableCell>
  <span className="font-medium">
    {formatAmount(user.totalCoinsReceived || 0)}
  </span>
</TableCell>
```

#### C. Update Pending Tokens Calculation (line 190)

```typescript
// Change from:
const totalPendingTokens = usersStatistics?.totalCoinsPurchased || 0

// To:
const totalPendingTokens = usersStatistics?.totalPendingTokens || 0
```

#### D. Update Issue Tokens Button Condition (line 376)

```typescript
// Change from:
{user.totalCoinsPurchased > 0 && (

// To:
{user.totalPendingTokens > 0 && (
```

#### E. Update Users Count Message (line 302)

```typescript
// Update to show users with pending tokens
{usersWithPurchases} users waiting for tokens • {totalPendingTokens.toLocaleString()} tokens to distribute
```

### 4. Update Type Definitions

**File**: `admin/src/services/usersApi.ts`

- Update `UserWithTransactions` interface to include:
  - `totalPendingTokens: number`
  - Ensure `totalCoinsReceived: number` exists

- Update statistics interface if needed to include `totalPendingTokens`

## Testing Points

1. Verify "Pending Tokens" displays sum of successful unreceived transactions
2. Verify table shows "Coins Received" instead of "Status"
3. Verify "Issue Tokens" button only appears for users with pending tokens
4. Verify "Issue All Tokens" button disabled when no pending tokens exist
5. Verify user details modal shows correct transaction states

### To-dos

- [ ] Update getUsersStatistics to calculate pending tokens from successful unreceived transactions
- [ ] Add totalPendingTokens field to UserWithTransactions interface and calculateUserStats method
- [ ] Update TypeScript interfaces in usersApi to include totalPendingTokens and totalCoinsReceived
- [ ] Update Presale page: change STATUS column to COINS RECEIVED and update button conditions
- [ ] Test the updated presale management flow with seed data