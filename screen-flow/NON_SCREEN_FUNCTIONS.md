# 3.1.4 Non-Screen Functions

This section describes the non-screen (background, asynchronous, automated, and server-side) functions of the Security Guard Company Marketplace Platform (SGCMP). The **Feature** column corresponds directly to the functional group names defined in **Project_Backlog.xlsx**, and the **Description** reflects the actual business and operational logic implemented in the system.

| # | Feature | System Function | Description |
| :-: | :--- | :--- | :--- |
| 1 | **Authentication** | Send Email Verification | Automatically generates a secure verification token and triggers an activation email to confirm the user's email address upon registration before granting access to the system. |
| 2 | **Authentication** | Send Password Reset Link | Automatically generates a time-limited password recovery link and dispatches an email to the user's registered address, managing link expiration to ensure secure account recovery. |
| 3 | **Authentication** | Validate Session & Role Permissions | A backend authentication and authorization process that verifies active user sessions, checks account status to block banned or inactive accounts, and enforces role-based access control against authorized user roles. |
| 4 | **Payment Management** | Process Payment Webhook | An automated background process that receives and verifies real-time payment webhook notifications from the payment gateway, confirms transaction amounts against order details, and marks payment status as completed. |
| 5 | **Payment Management** | Generate Dynamic VietQR & Transaction Code | Automatically creates unique transaction tracking codes and generates standard dynamic VietQR payment codes with pre-filled destination bank details, payable amounts, and transfer memos for automated reconciliation. |
| 6 | **Subscription Management** | Auto-Activate SaaS Subscription | A background process that automatically calculates subscription start dates, duration, and expiration timestamps immediately upon successful payment, activating the new service package and retiring previous active subscriptions. |
| 7 | **Subscription Management** | Auto-Expire Overdue Subscriptions | A periodic background check that scans active company subscriptions, automatically flags expired packages as inactive, and restricts the company's visibility on the public marketplace. |
| 8 | **Shift Management** | Auto-Evaluate Check-in Attendance | Automatically evaluates check-in timestamps against scheduled shift start times and company grace periods, classifying guard attendance as on-time or late, and automatically marking guards as absent if the cutoff threshold is exceeded. |
| 9 | **Shift Management** | Process Shift Check-in Photo Upload | A background storage service that processes, validates, and securely stores selfie photos captured during guard check-in into cloud storage, linking the verified image records directly to the corresponding shift assignment. |
| 10 | **Shift Management** | Auto-Update Work Shift Status | An automated process that monitors scheduled shift hours against current time, transitioning upcoming shifts to in-progress when work begins, and updating shift records to completed once assignments are fulfilled. |
| 11 | **Contract Management** | Validate Contract Expiration & Status | A background validation process that monitors active security contracts against validity dates, validates contract completion eligibility, and enforces guard allocation quota rules before contract finalization. |
| 12 | **Contract Management** | Generate Legal Contract Document | An automated document compilation engine that gathers approved service quotation details, parties' legal identities, shift schedules, and financial terms, converting monetary values into Vietnamese words and producing a standard legal contract document. |
| 13 | **Company Management** | Auto-Calculate Company Rating | An automated process triggered upon customer review submission that recalculates the security company's overall rating score, computing the new average star rating and updating total review counts. |
| 14 | **Company Management** | Send Publish Request Email Notification | Automatically triggers and sends notification emails to company representatives informing them of administrator approval or rejection decisions regarding their marketplace publishing requests. |
| 15 | **Guard Management** | Auto-Aggregate Guard Performance | A background calculation engine that analyzes attendance logs, evaluating on-time rates, late arrivals, absences, and shift replacements to calculate a composite performance score and performance rating for each guard. |
| 16 | **Chat System** | Real-Time Message Broadcast & Channel Sync | A real-time messaging pipeline that broadcasts incoming chat messages instantaneously between customers and company administrators, automatically updating unread message counters across active channels. |
| 17 | **Registration Moderation** | Auto-Provision Company Admin Account | An automated transactional process triggered upon administrator approval of a company registration, upgrading the user's role to company admin, creating the verified company profile, and sending an activation email. |
| 18 | **Admin Dashboard** | Auto-Aggregate System Revenue & Growth Analytics | A background data aggregation process that calculates platform-wide transaction volume, total revenue trends, user registration counts, and service package distribution for administrator oversight. |
| 19 | **Company Dashboard** | Auto-Calculate Active Guards on Shift & Daily Trend | An automated background calculation that aggregates real-time attendance to count guards currently on active duty across ongoing contracts, comparing figures with the previous day to establish operational performance trends. |

---

## Technical Overview

- **Authentication & Authorization (`Authentication`)**: Manages secure session lifecycles, user identity verification, and role-based permissions to protect platform access.
- **Payment & Invoicing (`Payment Management`, `Subscription Management`)**: Integrates real-time banking webhooks and automated QR billing to provide touchless subscription activation and expiration handling.
- **Field & Shift Operations (`Shift Management`, `Guard Management`)**: Automated evaluation of shift punctuality, secure photographic verification, and aggregated guard performance rating.
- **Communication & Notifications (`Chat System`, `Company Management`)**: Dispatches real-time peer-to-peer chat events and automated email alerts for key business milestones.
- **Contract & Platform Governance (`Contract Management`, `Registration Moderation`)**: Automates legal agreement generation, business moderation workflows, and platform-wide analytical reporting.
