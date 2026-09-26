# HƯỚNG DẪN DÀNH CHO AGENT (AGENT INSTRUCTIONS)

Khi người dùng yêu cầu viết hoặc cập nhật các Quy tắc nghiệp vụ (Business Rules), bạn (Agent) **PHẢI** tuân thủ chính xác cấu trúc Markdown dưới đây:

1. Sử dụng bảng gồm đúng 2 cột: Cột 1 là mã quy tắc (`BR ID`), Cột 2 là nội dung chi tiết của quy tắc (`Business Rule`).
2. Tuyệt đối không tự ý thêm hoặc bớt các cột khác (ví dụ: không thêm cột tên quy tắc, module liên quan) trừ khi được người dùng yêu cầu rõ ràng.
3. Nội dung mô tả quy tắc viết bằng Tiếng Anh, mang tính chất nghiệp vụ thực tế của hệ thống, không quá đặc thù vào tiểu tiết giao diện hay chức năng.

---

# Business Rules List

| BR ID | Business Rule |
| :--- | :--- |
| **BR-01** | Access to business features and data is restricted to authenticated users with valid role permissions. |
| **BR-02** | Account registration using disposable or temporary email domain providers is prohibited. |
| **BR-03** | Each email address must be unique across the system; no two accounts may share the same email. |
| **BR-04** | Each phone number must be unique across the system; no two accounts may share the same phone number. |
| **BR-05** | Each Identity Card (CCCD/CMND) number must be unique across the system; no two personnel profiles may share the same CCCD number. |
| **BR-06** | Coordinators and Security Guards must be at least 18 years of age at the time of profile registration. |
| **BR-07** | Security Guards must complete their mandatory legal profile requirements (CCCD photos, portrait photo, and valid address) before being eligible for shift assignment. |
| **BR-08** | Only user accounts with an active status are permitted to log in to the system. Suspended, blocked, or inactive accounts must be denied access. |
| **BR-09** | Newly registered Security Company accounts require review and approval by the System Admin before account activation. |
| **BR-10** | A business organization (Company) is allowed only one active subscription plan at any given time. |
| **BR-11** | System features, resources, and maximum guard quotas available to a company are determined by their active subscription plan. |
| **BR-12** | A company cannot add or activate security guards or coordinators if total active personnel reaches or exceeds the quota limit specified by its active subscription plan. |
| **BR-13** | When a company's SaaS subscription plan expires, creating new work shifts and adding new personnel are suspended until the plan is renewed. |
| **BR-14** | A SaaS subscription plan payment can only be initiated if the payment status is pending. Once completed or failed, it cannot be reprocessed. |
| **BR-15** | Upon successful completion of a SaaS plan payment, the system automatically activates or extends the corresponding subscription plan. |
| **BR-16** | A company must complete its profile checklist and upload required security business permits before submitting a publication request. |
| **BR-17** | Only companies in an active state are allowed to submit publication requests. |
| **BR-18** | Submitting a publication request transitions the company status to pending review, blocking duplicate submissions while awaiting approval. |
| **BR-19** | A company's profile and service offerings are publicly searchable by clients only after its publication request is approved by the System Admin. |
| **BR-20** | A security company may only register service offerings from the system master service catalog with a valid positive price and no duplicate service types. |
| **BR-21** | The system allows only one primary active bank account at any given time for receiving SaaS subscription plan payments. |
| **BR-22** | Company data records (Contracts, Requests, Shifts, Guards, Reviews, Chats) are strictly isolated; Company Admins can only view and manage data belonging to their own organization. |
| **BR-23** | Service proposals and quotations can only be issued to clients after a target site inspection report has been approved by company management. |
| **BR-24** | Rejecting a target site inspection report requires mandatory comments detailing the reason for rejection. |
| **BR-25** | Service contracts must be initialized directly from client-accepted service proposals and quotations. |
| **BR-26** | Signed contract documents (in PDF format) are immutable and cannot be modified or replaced after customer and company signatures are completed. |
| **BR-27** | Only authorized company personnel (Company Admin) are allowed to sign and confirm a contract on behalf of the company. |
| **BR-28** | A contract can only be signed if it is in a valid state (e.g., pending signature, not already active or canceled). |
| **BR-29** | A contract can only be completed by a Customer if it is currently in an active state and its end date is today or in the past. |
| **BR-30** | Completing a contract transitions its status to completed, which is an irreversible action. |
| **BR-31** | Coordinator access is restricted to approved bookings with active contracts belonging to their own organization. |
| **BR-32** | Only authenticated users with the role of Coordinator or Company Admin are authorized to schedule and assign work shifts for their company. |
| **BR-33** | All scheduled work shifts must fall strictly within the validity period (start date to end date) of the corresponding contract. |
| **BR-34** | The number of security guards assigned to a work shift must exactly match the required number of guards per slot specified in the contract. |
| **BR-35** | A security guard cannot be assigned to overlapping shifts or multiple shifts occurring at the same time. |
| **BR-36** | Work shift assignments can only be made for security guards with an active account status under active contracts. |
| **BR-37** | A single work shift segment must not exceed a maximum duration of 8 hours. |
| **BR-38** | When splitting a booking time slot, split segments must be contiguous, non-overlapping, and their total duration must equal the original time slot. |
| **BR-39** | Shift swap requests between guards can only be approved if the replacement guard has no schedule conflicts and meets all post requirements. |
| **BR-40** | When a guard is absent or an emergency arises, Coordinators have emergency dispatch privileges to assign a standby guard to cover the post. |
| **BR-41** | A security guard is restricted to accessing, viewing, and checking in to only the work shifts explicitly assigned to them on the current date. |
| **BR-42** | Guards may check in only from the scheduled shift start time until the company's maximum allowed absence threshold. |
| **BR-43** | Guard attendance status (On Time, Late, Absent) is determined by the company's attendance policy: check-in within the configured late grace period is marked On Time; check-in between the late grace period and the absence threshold is marked Late; exceeding the absence threshold marks the guard as Absent and prohibits further check-in. |
| **BR-44** | A Guard may check in only once per assigned work shift. |
| **BR-45** | A valid check-in requires the guard to capture a live photograph while checking in. |
| **BR-46** | Clients or Coordinators may submit shift incident reports (Late, Absent, Sleeping, Bad Attitude, Other) with proof photos and descriptions. |
| **BR-47** | A quality review can only be submitted if the contract is in the completed state, with a maximum of one review allowed per contract. |
| **BR-48** | A company is prohibited from submitting a new publication request while a previous publication request is in the pending review state. |
| **BR-49** | Rejecting a company registration or publication request by the System Admin requires a mandatory recorded reason for rejection. |
| **BR-50** | A security company must provide a valid business license number and upload a verifiable license document before requesting public listing. |
| **BR-51** | Activating a new system bank account automatically deactivates any previously active system bank account. |
| **BR-52** | Deactivating or deleting the active system bank account renders the SaaS subscription plan payment feature temporarily unavailable until another account is activated. |
| **BR-53** | Booking requests follow a strict state progression (Pending, Quoted, Accepted, Contract Created, Rejected, or Canceled). |
| **BR-54** | A booking request cannot be canceled by the customer or company once a corresponding service contract has entered the active state. |
| **BR-55** | Transitioning a contract to the active state strictly requires completed digital signatures from both the authorized Company Admin and the Customer. |
| **BR-56** | Shift incident reports must progress sequentially through defined lifecycle stages (Pending, In Progress, Resolved, and Closed). |
| **BR-57** | Quality reviews and ratings can only be submitted by Customers for contracts that are in the completed status. |
| **BR-58** | Submitted customer reviews cannot be modified or deleted. |
| **BR-59** | Real-time chat conversations must be initiated by Customers; Security Companies are permitted only to respond to conversations initiated by Customers. |
