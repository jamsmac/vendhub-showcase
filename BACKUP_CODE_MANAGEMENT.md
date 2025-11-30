# Backup Code Management System

## Overview

A comprehensive backup code management system has been implemented to provide users with secure account recovery options for 2FA-enabled accounts. The system includes database schema, backend services, and a polished UI for viewing, downloading, and regenerating backup codes.

## Architecture

### Database Schema

A new `backupCodes` table has been added to store backup codes securely:

```typescript
export const backupCodes = mysqlTable("backupCodes", {
  id: int().autoincrement().notNull(),
  userId: int().notNull(),
  code: varchar({ length: 20 }).notNull(),
  isUsed: boolean().default(false).notNull(),
  usedAt: timestamp({ mode: 'string' }),
  generationId: varchar({ length: 36 }).notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
  index('backupCodes_userId_idx').on(table.userId),
  index('backupCodes_generationId_idx').on(table.generationId),
  index('backupCodes_isUsed_idx').on(table.isUsed),
]);
```

**Key Fields:**
- `userId`: Links codes to user accounts
- `code`: 8-character alphanumeric backup code
- `isUsed`: Tracks whether code has been consumed
- `usedAt`: Timestamp of code usage for audit trail
- `generationId`: UUID to group codes from same generation batch

### Backend Services

#### BackupCodeService (`server/services/backupCodeService.ts`)

Comprehensive service for managing backup codes with the following methods:

**Code Generation & Storage:**
- `generateBackupCodes()`: Generates 10 unique 8-character codes
- `storeBackupCodes(userId, codes)`: Stores codes in database, invalidating previous ones
- `regenerateBackupCodes(userId)`: Complete regeneration workflow

**Code Retrieval:**
- `getUserBackupCodes(userId)`: Fetches only unused codes
- `getAllUserBackupCodes(userId)`: Fetches all codes including used ones
- `getBackupCodeStats(userId)`: Returns statistics (total, used, unused, lastGenerated)

**Code Verification:**
- `verifyAndConsumeBackupCode(userId, code)`: Validates and marks code as used
- `deleteBackupCodes(userId)`: Removes all codes for user

### Frontend Components

#### BackupCodeManager (`client/src/components/BackupCodeManager.tsx`)

Main component for displaying and managing backup codes with features:

**Display Features:**
- Statistics dashboard showing total, used, and unused codes
- Tabbed interface for "Unused" and "All Codes" views
- Code visibility toggle (show/hide for security)
- Copy-to-clipboard functionality for individual codes
- Last generation date display

**Download & Export:**
- Download codes as text file with current date
- Automatic filename: `backup-codes-YYYY-MM-DD.txt`
- Only exports unused codes

**Visual Design:**
- Color-coded badges (green for unused, red for used)
- Security alert banner with warnings
- Security recommendations card with best practices
- Responsive grid layout for statistics

**Security Features:**
- Clear warnings about one-time use
- Recommendations for password manager storage
- Instructions to keep codes separate from authenticator
- Periodic regeneration guidance

#### RegenerateBackupCodesDialog (`client/src/components/RegenerateBackupCodesDialog.tsx`)

Multi-step dialog for safe backup code regeneration:

**Step 1 - Warning:**
- Explains consequences of regeneration
- Lists what will happen (old codes invalidated, new codes generated)
- Requires explicit acknowledgment via checkbox

**Step 2 - Confirmation:**
- Final warning about irreversibility
- Checklist of prerequisites (saved codes, authenticator access)
- Requires confirmation to proceed

**Step 3 - Success:**
- Displays newly generated codes
- Copy all codes button
- Download codes button
- Clear next steps guidance

**UX Features:**
- Back button to return to warning step
- Loading states during regeneration
- Toast notifications for user feedback
- Automatic dialog reset on close

### Integration with UserSettings

The backup code manager is integrated into the Security tab of UserSettings:

**Conditional Display:**
- Only shown when 2FA is enabled
- Appears alongside 2FA, password, and session management cards

**Quick Actions:**
- "Regenerate Codes" button in 2FA card
- Opens RegenerateBackupCodesDialog
- Triggers full backup code management interface

## Usage Flow

### Initial Setup
1. User enables 2FA in UserSettings
2. Backup codes are automatically generated
3. User is prompted to download/save codes
4. Codes are stored in database with generation timestamp

### Viewing Codes
1. User navigates to Security tab in UserSettings
2. BackupCodeManager displays statistics and codes
3. User can toggle visibility and copy individual codes
4. Download button exports all unused codes

### Regeneration
1. User clicks "Regenerate Codes" button
2. RegenerateBackupCodesDialog opens with warning
3. User acknowledges understanding of consequences
4. Confirmation step requires final approval
5. New codes are generated and displayed
6. User downloads/saves new codes
7. Old codes are invalidated in database

### Code Consumption
1. During login, if 2FA code fails, user can use backup code
2. BackupCodeService.verifyAndConsumeBackupCode() validates code
3. Code is marked as used with timestamp
4. User is notified code was consumed
5. Code no longer appears in "Unused" tab

## Security Considerations

### Code Generation
- 10 codes per generation (standard for 2FA backup codes)
- 8-character alphanumeric format (uppercase)
- Random generation using Math.random() with base36 conversion
- Each code is unique within generation batch

### Storage
- Codes stored in plaintext in database (consider hashing in production)
- Indexed by userId for quick retrieval
- GenerationId groups codes from same batch
- Soft deletion via `isUsed` flag with timestamp

### Display
- Codes hidden by default (show/hide toggle)
- Copy-to-clipboard for individual codes
- Download exports only unused codes
- No codes visible in browser console or network requests

### Audit Trail
- `usedAt` timestamp tracks when each code was consumed
- `createdAt` timestamp tracks generation date
- `generationId` allows tracking code batches
- Database queries can generate audit reports

## Integration Checklist

- [x] Database schema created (`backupCodes` table)
- [x] Backend service implemented (`BackupCodeService`)
- [x] Main UI component created (`BackupCodeManager`)
- [x] Regeneration dialog implemented (`RegenerateBackupCodesDialog`)
- [x] Integrated into UserSettings page
- [ ] tRPC endpoints created (TODO)
- [ ] Database migration executed (TODO - requires interactive drizzle-kit)
- [ ] Unit tests written (TODO)
- [ ] E2E tests written (TODO)

## Next Steps

### Backend Integration
1. Create tRPC endpoints in `server/routers/auth.ts`:
   - `getBackupCodes`: Fetch user's backup codes
   - `regenerateBackupCodes`: Generate and store new codes
   - `verifyBackupCode`: Validate code during login
   - `getBackupCodeStats`: Fetch statistics

2. Connect BackupCodeManager component to tRPC queries
3. Connect RegenerateBackupCodesDialog to regeneration mutation

### Database Migration
1. Run `pnpm db:push` to create backupCodes table
2. Verify table creation in database
3. Test queries with sample data

### Testing
1. Unit tests for BackupCodeService methods
2. Integration tests for tRPC endpoints
3. E2E tests for UI workflows:
   - View codes
   - Download codes
   - Regenerate codes
   - Use code during login

### Production Hardening
1. Consider hashing backup codes before storage
2. Implement rate limiting on code verification
3. Add email notification when codes are regenerated
4. Implement audit logging for code usage
5. Consider encryption for code storage

## File Locations

- **Database Schema**: `drizzle/schema.ts`
- **Backend Service**: `server/services/backupCodeService.ts`
- **UI Components**: 
  - `client/src/components/BackupCodeManager.tsx`
  - `client/src/components/RegenerateBackupCodesDialog.tsx`
- **Integration**: `client/src/pages/UserSettings.tsx`

## Component Props & Interfaces

### BackupCodeManager
```typescript
interface BackupCodeManagerProps {
  userId: number;
  onCodesRegenerated?: () => void;
}
```

### RegenerateBackupCodesDialog
```typescript
interface RegenerateBackupCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}
```

## Security Recommendations for Users

The system includes built-in recommendations displayed to users:

1. **Storage**: Use a password manager (Bitwarden, 1Password, etc.)
2. **Sharing**: Never share backup codes with anyone
3. **One-Time Use**: Each code can only be used once
4. **Separation**: Keep codes separate from authenticator app
5. **Rotation**: Regenerate codes periodically or after use

## Design Highlights

- **Clear Warnings**: Multi-step confirmation prevents accidental regeneration
- **Visual Hierarchy**: Color coding and badges for code status
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Dark Mode**: Full dark mode support with appropriate colors
- **Responsive**: Works on mobile, tablet, and desktop
- **User-Friendly**: Copy buttons, download functionality, clear instructions

## Performance Considerations

- **Indexed Queries**: userId, generationId, and isUsed are indexed
- **Pagination**: Consider adding pagination for users with many codes
- **Caching**: tRPC queries can be cached client-side
- **Lazy Loading**: Codes loaded on-demand when tab is opened

## Future Enhancements

1. **Export Formats**: Add PDF export with QR codes
2. **Email Backup**: Send codes via email with encryption
3. **SMS Backup**: Send codes via SMS for quick access
4. **Backup Code Expiration**: Implement code expiration dates
5. **Usage Analytics**: Track code usage patterns
6. **Notifications**: Email/SMS when codes are regenerated
7. **Code Recovery**: Allow users to recover unused codes
8. **Batch Operations**: Regenerate multiple users' codes
