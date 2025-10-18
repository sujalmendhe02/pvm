# PrintVend API Documentation

## Overview

The PrintVend system uses Supabase Edge Functions for backend operations and Supabase Realtime for live updates.

## Base URL

```
https://vdcjaupmngqhbnqgvypk.supabase.co/functions/v1
```

## Authentication

All requests require the Supabase anonymous key in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Edge Functions

### 1. Connect to Machine

**Endpoint:** `POST /connect-machine`

**Description:** Establishes connection between user and vending machine

**Request Body:**
```json
{
  "machineKey": "ABCD1234",
  "userName": "Sujal Mendhe"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "machine": {
    "id": "uuid",
    "machine_key": "ABCD1234",
    "name": "Machine-1",
    "location": "Nagpur Railway Station",
    "status": "online",
    "rate_per_page": 2.0
  },
  "user": {
    "id": "uuid",
    "name": "Sujal Mendhe",
    "created_at": "2025-10-18T..."
  },
  "session": {
    "id": "uuid",
    "machine_id": "uuid",
    "user_id": "uuid",
    "socket_room": "machine-uuid-uuid",
    "status": "active"
  },
  "socketRoom": "machine-uuid-uuid"
}
```

**Error Responses:**
- `400`: Missing required fields
- `404`: Machine not found
- `503`: Machine is offline
- `500`: Server error

---

### 2. Create Print Job

**Endpoint:** `POST /create-job`

**Description:** Creates a new print job in the queue

**Request Body:**
```json
{
  "machineId": "uuid",
  "userId": "uuid",
  "userName": "Sujal Mendhe",
  "fileUrl": "https://...",
  "fileName": "document.pdf",
  "totalPages": 10,
  "pagesToPrint": "1-3,5,7",
  "pagesCount": 5,
  "priority": 2
}
```

**Field Details:**
- `priority`: 1 (urgent) or 2 (normal)
- `pagesToPrint`: Comma-separated page ranges (e.g., "1-3,5,7")
- `pagesCount`: Total number of pages to print

**Success Response (200):**
```json
{
  "success": true,
  "job": {
    "id": "uuid",
    "machine_id": "uuid",
    "user_id": "uuid",
    "user_name": "Sujal Mendhe",
    "file_url": "https://...",
    "file_name": "document.pdf",
    "total_pages": 10,
    "pages_to_print": "1-3,5,7",
    "pages_count": 5,
    "priority": 2,
    "status": "queued",
    "cost": "10.00",
    "payment_status": "pending",
    "created_at": "2025-10-18T..."
  },
  "queuePosition": 3,
  "queueLength": 5
}
```

**Cost Calculation:**
```
cost = pagesCount × machineRatePerPage × priorityFactor

where priorityFactor = 1.5 (urgent) or 1.0 (normal)
```

**Error Responses:**
- `400`: Missing required fields
- `404`: Machine not found
- `500`: Failed to create job

---

### 3. Get Machine Status

**Endpoint:** `GET /machine-status?machineKey=ABCD1234`

**Description:** Retrieves machine information and current queue status

**Query Parameters:**
- `machineKey` (required): The machine key (e.g., "ABCD1234")

**Success Response (200):**
```json
{
  "machine": {
    "id": "uuid",
    "machine_key": "ABCD1234",
    "name": "Machine-1",
    "location": "Nagpur Railway Station",
    "status": "online",
    "rate_per_page": 2.0
  },
  "queue": [
    {
      "id": "uuid",
      "user_name": "Sujal",
      "file_name": "document.pdf",
      "pages_count": 5,
      "priority": 1,
      "status": "printing",
      "created_at": "2025-10-18T..."
    },
    {
      "id": "uuid",
      "user_name": "Rahul",
      "file_name": "report.pdf",
      "pages_count": 10,
      "priority": 2,
      "status": "queued",
      "created_at": "2025-10-18T..."
    }
  ],
  "queueLength": 2
}
```

**Error Responses:**
- `400`: Missing machine key
- `404`: Machine not found
- `500`: Failed to fetch queue

---

## Database Schema

### Tables

#### machines
```sql
CREATE TABLE machines (
  id uuid PRIMARY KEY,
  machine_key text UNIQUE NOT NULL,
  name text NOT NULL,
  location text NOT NULL,
  status text DEFAULT 'offline',
  rate_per_page numeric DEFAULT 2.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### users
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz DEFAULT now()
);
```

#### print_jobs
```sql
CREATE TABLE print_jobs (
  id uuid PRIMARY KEY,
  machine_id uuid REFERENCES machines(id),
  user_id uuid REFERENCES users(id),
  user_name text NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  total_pages integer NOT NULL,
  pages_to_print text NOT NULL,
  pages_count integer NOT NULL,
  priority integer DEFAULT 2,
  status text DEFAULT 'queued',
  cost numeric NOT NULL,
  payment_status text DEFAULT 'pending',
  payment_id text,
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);
```

#### sessions
```sql
CREATE TABLE sessions (
  id uuid PRIMARY KEY,
  machine_id uuid REFERENCES machines(id),
  user_id uuid REFERENCES users(id),
  socket_room text NOT NULL,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## Realtime Subscriptions

### Subscribe to Job Updates

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const channel = supabase
  .channel('print-jobs-changes')
  .on(
    'postgres_changes',
    {
      event: '*',           // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'print_jobs',
      filter: `id=eq.${jobId}`
    },
    (payload) => {
      console.log('Job updated:', payload.new);
      // Update UI with new job status
    }
  )
  .subscribe();

// Cleanup
supabase.removeChannel(channel);
```

### Subscribe to Machine Queue

```javascript
const channel = supabase
  .channel('queue-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'print_jobs',
      filter: `machine_id=eq.${machineId}`
    },
    (payload) => {
      console.log('Queue updated:', payload);
      // Refresh queue display
    }
  )
  .subscribe();
```

---

## Job Statuses

### Print Job Status Flow

```
pending → queued → printing → completed
                           → failed
                           → cancelled
```

**Status Descriptions:**
- `queued`: Job is waiting in the priority queue
- `printing`: Job is currently being printed
- `completed`: Job finished successfully
- `failed`: Job failed to print
- `cancelled`: Job was cancelled by user

### Payment Status Flow

```
pending → paid
        → failed
```

**Status Descriptions:**
- `pending`: Payment not yet completed
- `paid`: Payment successful
- `failed`: Payment failed

---

## Priority Queue Algorithm

Jobs are processed in this order:

1. **Priority Level** (ascending)
   - Priority 1 (Urgent) processed first
   - Priority 2 (Normal) processed second

2. **Created Time** (ascending)
   - Within the same priority, older jobs are processed first

**SQL Query:**
```sql
SELECT * FROM print_jobs
WHERE machine_id = 'uuid'
  AND status IN ('queued', 'printing')
ORDER BY priority ASC, created_at ASC;
```

---

## Sample Data

### Pre-configured Machines

```json
[
  {
    "machine_key": "ABCD1234",
    "name": "Machine-1",
    "location": "Nagpur Railway Station",
    "status": "online",
    "rate_per_page": 2.0
  },
  {
    "machine_key": "EFGH5678",
    "name": "Machine-2",
    "location": "Nagpur Airport",
    "status": "online",
    "rate_per_page": 2.5
  },
  {
    "machine_key": "IJKL9012",
    "name": "Machine-3",
    "location": "Sitabuldi Market",
    "status": "offline",
    "rate_per_page": 2.0
  }
]
```

---

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (missing/invalid parameters)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error
- `503`: Service Unavailable (machine offline)

---

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider:
- Rate limit per IP: 100 requests/minute
- Rate limit per user: 50 requests/minute
- Queue size limit per machine: 50 jobs

---

## Security Considerations

1. **File Upload**: Files are validated client-side for PDF format
2. **RLS Policies**: Database access controlled via Row Level Security
3. **Input Validation**: All inputs sanitized on backend
4. **Payment Security**: Razorpay handles sensitive payment data
5. **CORS**: Properly configured for cross-origin requests

---

## Testing

### cURL Examples

**Connect to Machine:**
```bash
curl -X POST \
  https://vdcjaupmngqhbnqgvypk.supabase.co/functions/v1/connect-machine \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "machineKey": "ABCD1234",
    "userName": "Test User"
  }'
```

**Get Machine Status:**
```bash
curl -X GET \
  'https://vdcjaupmngqhbnqgvypk.supabase.co/functions/v1/machine-status?machineKey=ABCD1234' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

---

## Support

For issues or questions, please refer to the main README.md or contact support.
