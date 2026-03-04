# पुस्तकHolic - Connecting Next Gen Indian Librarians and Readers

## Overview
पुस्तकHolic is a web-based platform designed to connect librarians and readers in a modern digital ecosystem. The platform allows librarians to manage book inventories while enabling readers to discover, borrow, review, and discuss books.<br><br>
The system supports multiple librarians and readers simultaneously and introduces community features that encourage interaction between readers. By integrating library management with a social reading network, PustakHolic aims to modernize traditional library systems.

## Key Features

### 1. Dual User Portals
The platform provides separate portals for two types of users:

<b>Reader Portal</b>:

• Browse books available in libraries<br>
• Borrow books from librarians<br>
• Write reviews and ratings for books<br>
• View profiles of other readers<br>
• Connect with members of the reading community<br>

<b>Librarian Portal</b>

• Add books to the library collection<br>
• Edit or update book information<br>
• Remove books from circulation<br>
• Track borrowed books<br>
• Mark readers as defaulters for overdue returns<br>

### 2. Book Management

<b>Librarians can manage their inventory by performing the following actions:</b>

• Add new books<br>
• Update book details<br>
• Remove books from the catalog<br>
• Track availability and quantity<br>

### 3. Borrowing and Return System

<b>Readers can request and borrow books through the platform. The system tracks:</b>

• Borrow date<br>
• Return requests<br>
• Reading history<br>
• Book availability<br>

Return requests are handled through a structured request workflow between readers and librarians.

### 4. Defaulter Management
To maintain accountability, librarians can mark readers as defaulters when books are not returned within the expected timeframe. The system can also track penalties associated with overdue returns.

### 5. Reader Community
Readers can view the profiles of other readers and interact within the platform. This feature promotes discussion, book discovery, and community-driven reading recommendations.

### 6. Review and Rating System
Readers can post reviews and provide ratings for books they have read. These reviews help other readers make informed decisions and encourage engagement within the reading community.

## 7. System Architecture
<b>PustakHolic follows a full-stack client–server architecture consisting of three main layers:<b>

1.Frontend (Client Application)<br>
2.Backend (API Server)<br>
3.Database (MySQL)<br>

The system is designed to separate concerns between user interface, business logic, and data persistence.<br>
<b>High level system architecture:</b><br>
```
                 ┌─────────────────────────┐
                 │        Frontend         │
                 │        (Client)         │
                 │                         │
                 │  React + Vite           │
                 │  UI Components          │
                 │  Authentication         │
                 │  Book Browsing          │
                 │  Reader Community       │
                 └───────────┬─────────────┘
                             │
                             │ HTTP Requests
                             ▼
                 ┌─────────────────────────┐
                 │        Backend          │
                 │       Node.js API       │
                 │       Express Server    │
                 │                         │
                 │  Authentication Logic   │
                 │  Borrow Management      │
                 │  Review Handling        │
                 │  Defaulter Tracking     │
                 │  Return Requests        │
                 └───────────┬─────────────┘
                             │
                             │ SQL Queries
                             ▼
                 ┌─────────────────────────┐
                 │        Database         │
                 │         MySQL           │
                 │                         │
                 │  Readers                │
                 │  Librarians             │
                 │  Books                  │
                 │  Borrow Records         │
                 │  Reviews                │
                 │  Defaulters             │
                 │  Return Requests        │
                 └─────────────────────────┘
```
## 8. Database Schema

Attach Schema Image here!

## 9. Future Improvements

<b>Possible future enhancements include:</b>

• AI-based book recommendation system<br>
• Reader discussion forums<br>
• Mobile application support<br>
• Advanced search and filtering<br>
• Digital book previews<br>
• Integration with e-book providers<br>

## Conclusion
PustakHolic provides a modern solution for connecting librarians and readers through a centralized platform.<br> By combining library management with community interaction features, the system improves accessibility, encourages reading culture, and simplifies the borrowing process for both librarians and readers.
