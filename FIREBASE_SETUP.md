# Firebase Database Structure

## Collections

### users
```
{
  id: string (user UID)
  name: string
  email: string
  avatar_url?: string
  city?: string
  bio?: string
  created_at: timestamp
}
```

### ads
```
{
  id: string (auto-generated)
  title: string
  description: string
  price: number
  category_id: string
  location: string
  postal_code: string
  user_id: string
  images: string[] (Firebase Storage URLs)
  status: 'active' | 'sold' | 'inactive'
  created_at: timestamp
  updated_at: timestamp
}
```

### messages
```
{
  id: string (auto-generated)
  sender_id: string
  receiver_id: string
  ad_id?: string
  content: string
  read: boolean
  created_at: timestamp
}
```

### favorites
```
{
  id: string (user_id + ad_id)
  user_id: string
  ad_id: string
  created_at: timestamp
}
```

### conversations
```
{
  id: string (auto-generated)
  participants: string[] [user_id1, user_id2]
  last_message: string
  last_message_time: timestamp
  ad_id?: string
}
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /ads/{adId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
    }

    match /messages/{messageId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.sender_id ||
         request.auth.uid == resource.data.receiver_id);
      allow create: if request.auth != null && request.auth.uid == request.resource.data.sender_id;
    }

    match /favorites/{favoriteId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow write: if request.auth != null && request.auth.uid == request.resource.data.user_id;
    }

    match /conversations/{conversationId} {
      allow read: if request.auth != null && request.auth.uid in resource.data.participants;
      allow write: if request.auth != null && request.auth.uid in request.resource.data.participants;
    }
  }
}
```

## Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /ads/{adId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /avatars/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Setup Instructions

1. Go to Firebase Console: https://console.firebase.google.com
2. Select project: kupado-d3b82
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
   - Enable "Google"
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Copy the security rules above
5. Set up Storage:
   - Go to Storage
   - Get started
   - Copy the storage rules above
6. Update Firebase config in lib/firebase.ts with your actual appId
