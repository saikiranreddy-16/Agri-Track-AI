# Database Documentation - MongoDB Schema

This project utilizes MongoDB as the primary database, accessed via the Mongoose ODM.

## Collections

### Users (`users`)
Stores information about registered accounts in the system.

#### Schema Structure
| Field | Type | Required | Unique | Indexed | Description / Validation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Yes | Yes (Auto) | Unique database identifier |
| `name` | String | Yes | No | No | Plaintext name, whitespace trimmed |
| `email` | String | Yes | Yes | Yes | Standard format, lowercased, whitespace trimmed |
| `password` | String | Yes | No | No | Hashed using bcrypt (10 rounds) |
| `phone` | String | Yes | No | No | Contact number, whitespace trimmed |
| `company` | String | No | No | No | Associated farm company name, defaults to `""` |
| `role` | String | Yes | No | No | String enum: `['Admin', 'Farm Owner', 'Manager', 'Operator', 'Mechanic', 'Viewer']`. Defaults to `'Operator'`. |
| `createdAt` | Date | Yes (Auto) | No | No | Timestamp of creation (managed by mongoose) |
| `updatedAt` | Date | Yes (Auto) | No | No | Timestamp of last modification (managed by mongoose) |

#### Database Indexes
- `email`: Single-field unique index for instant lookup and uniqueness constraints.
  ```javascript
  userSchema.index({ email: 1 }, { unique: true });
  ```

#### Operations Hook
- **Pre-save Hook (`save`)**: Automatically intercept password creations or revisions and hash them with 10 salt rounds before database insertion.
