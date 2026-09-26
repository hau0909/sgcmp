# SCREEN DESCRIPTION SPECIFICATION

This document provides the complete screen description specification for the SGCMP system, organized by actor groups in the required order: **Guest**, **Customer**, **Company Admin**, **Coordinator**, **Guard**, and **Admin**.

**Feature** corresponds to the function name from **Project_Backlog.xlsx**, and **Screen** indicates the screen name from the **Screen Flow** diagrams with `(Popup)` indicators where applicable.

| # | Feature (Backlog Function) | Screen (Screen Flow) | Description |
| :---: | :--- | :--- | :--- |
| | **--- GUEST ACTOR ---** | | |
| 1 | View Top rated companies | Home | Allows users to view the top 4 highest-rated security companies on the home page, sorted automatically by average customer rating. |
| 2 | View Companies | View Companies | Allows users to browse and search security companies on the marketplace. |
| 3 | View Company Details | View Company Details | Allows users to view detailed information of a security company including its profile, services, and customer reviews. |
| 4 | Compare companies | Compare Companies | Allows users to compare basic information of selected security companies such as ratings, completed contracts, years of operation, address, and services. |
| 5 | Register company | Register Company | Allows customers to submit an initial registration form for a new security company. |
| 6 | Register | Register | Allows guests to create a new account using email and password. |
| 7 | Login | Login | Allows users to sign in to the system with their credentials. |
| 8 | Email verification | Email verification | Allows users to verify their email address after registration. |
| 9 | Forgot password | Forgot password | Allows users to request a password reset link via email. |
| | **--- CUSTOMER ACTOR ---** | | |
| 10 | View Profile Detail | View Profile Detail | Allows all authenticated users to view and update their personal profile information. |
| 11 | Reset Password | Reset Password (Popup) | Allows users to set a new password after receiving the reset link. |
| 12 | Send Service request | Send Service request (Popup) | Allows the customer to submit a new service request to a security company. |
| 13 | view my requests | View my requests | Allows the customer to view all service requests they have submitted. |
| 14 | view my request detail | View my request detail | Allows the customer to view request details and review the company's quotation. |
| 15 | Confirm/Deny quotation (customer) | Confirm/Deny quotation (Popup) | Allows the customer to review and confirm or deny the company's quotation. |
| 16 | View My Contracts | View My Contract | Allows the customer to view all their contracts with security companies. |
| 17 | View My Contract Detail | View My Contract Detail | Allows the customer to view contract details. |
| 18 | Confirm Contract By Customer | Confirm Contract By Customer (Popup) | Allows the customer to confirm the contract. |
| 19 | Complete Contract (customer) | Complete Contract (Popup) | Allows the customer to mark an active contract as completed. |
| 20 | View Contract Shift Schedule | View contract shift schedule | Allows the customer to view the shift schedule of guards assigned to their contract. |
| 21 | Send Service Review | Send Service Review (Popup) | Allows the customer to rate and submit a review for a completed service. |
| 22 | View my reports | View my reports | Allows the customer to view incident reports they have submitted. |
| 23 | Submit report | Submit report (Popup) | Allows the customer to submit an incident report. |
| 24 | View my report detail | View my report detail | Allows the customer to view details of a submitted incident report. |
| 25 | View register request | View register request | Allows the customer to track the approval status of their submitted company registration. |
| 26 | Chat with company | Chat with company (Popup) | Allows the customer to send and receive real-time messages with the security company. |
| | **--- COMPANY ADMIN ACTOR ---** | | |
| 27 | Company Dashboard | Dashboard | Allows the company admin to view an overview of company activity including contracts, requests, and revenue. |
| 28 | View Company Profile (Company) | View Company Profile | Allows the company admin to view and edit company information. |
| 29 | Add Company Service | Add Company Service (Popup) | Allows the company admin to add new services to the company profile. |
| 30 | Send Publish Request | Send Publish Request (Popup) | Allows the company admin to submit a request to publish the company on the marketplace. |
| 31 | View and Manage Subscription | View and Manage Subscription | Allows the company admin to view the current subscription plan and access renewal options. |
| 32 | Pay SaaS Plan | Pay SaaS Plan | Allows the company admin to pay for a SaaS subscription plan via VietQR code. |
| 33 | View Coordinator List | View Coordinators | Allows the company admin to view all coordinators belonging to the company. |
| 34 | View Coordinator detail | View Coordinator detail | Allows the company admin to view a coordinator's profile and update their information. |
| 35 | Create Coordinator Account | Create Coordinator Account | Allows the company admin to create a new coordinator account. |
| 36 | View Contracts | View Contracts | Allows the company admin to view all contracts with customers. |
| 37 | View Contract Detail | View Contract Detail | Allows the company admin to view contract details and physical contract files. |
| 38 | Upload Physical Contract | Upload Physical Contract (Popup) | Allows the company admin to upload the physical signed contract file. |
| 39 | Confirm Contract By Company | Confirm Contract By Company (Popup) | Allows the company admin to confirm the contract. |
| 40 | Export Contract | Export Contract (Popup) | Allows the company admin or coordinator to export the contract document file. |
| 41 | view requests | View requests | Allows the company admin to view all service requests received from customers. |
| 42 | view request detail | View request detail | Allows the company admin to view details of a customer service request. |
| 43 | Update service quotation (company) | Update service quotation (Popup) | Allows the company admin to update and send the service quotation to the customer. |
| 44 | Reject Service Request | Reject Service Request (Popup) | Allows the company admin to reject a service request. |
| 45 | View Request Verifications | View Request Verifications | Allows the company admin to view all service request verifications. |
| 46 | View Request Verification Detail | View Request Verification Detail | Allows the company admin to review the details of a service request verification. |
| 47 | Approve/Reject Request Verification | Approve/Reject Request Verification (Popup) | Allows the company admin to approve or reject a service request verification. |
| 48 | View Review list (Company) | View Review list | Allows the company admin to view all customer reviews submitted for the company. |
| 49 | Chat with customer | Chat with customer | Allows the company admin to send and receive real-time messages with customers. |
| | **--- COORDINATOR ACTOR ---** | | |
| 50 | Coordinator Dashboard | Dashboard | Allows the coordinator to view an overview of their assigned responsibilities and shift activity. |
| 51 | View Guards | View Guards | Allows the coordinator to view and search all security guards under their management. |
| 52 | View guard detail | View guard detail | Allows the coordinator to view a guard's profile and update their information. |
| 53 | Create Guard Account | Create Guard Account (Popup) | Allows the coordinator to create a new guard account. |
| 54 | Approve/Reject guard profile | Approve/Reject guard profile (Popup) | Allows the coordinator to review and approve or reject a guard profile. |
| 55 | View Guard Performance | View Guard Performance | Allows the coordinator to view attendance and check-in performance statistics for each guard. |
| 56 | View work shifts | View work shifts | Allows the coordinator to view work shift schedules. |
| 57 | Create work shift | Create work shift (Popup) | Allows the coordinator to create and manage work shift schedules and assign guards. |
| 58 | Dispatch replacement guard | Dispatch replacement guard (Popup) | Allows the coordinator to assign a replacement guard to a shift. |
| 59 | View Shift Substitute Requests | View Shift Substitute Request | Allows the coordinator to view shift substitute requests submitted by guards. |
| 60 | Approve/Reject shift Substitute | Approve/Reject shift Substitute (Popup) | Allows the coordinator to approve or reject a shift substitute request. |
| 61 | View reports | View reports | Allows the coordinator to view submitted incident reports. |
| 62 | Update reports | Update reports (Popup) | Allows the coordinator to update the status and notes of an incident report. |
| 63 | View Request Verifications (Coor) | View Request Verifications | Allows the coordinator to view service request verifications assigned to them. |
| 64 | View Request Verification Detail (Coor) | View Request Verification Detail | Allows the coordinator to review the details of an assigned service request verification. |
| 65 | Update Request Verification | Update Request Verification (Popup) | Allows the coordinator to update findings and details of a service request verification. |
| 66 | View Bookings | View Bookings | Allows the coordinator to view bookings and contracts assigned to their team. |
| 67 | View Booking Detail | View Booking Detail | Allows the coordinator to view the details of an assigned booking. |
| | **--- GUARD ACTOR ---** | | |
| 68 | View shift schedule | View shift schedule | Allows the guard to view their weekly shift calendar. |
| 69 | View my work shift | View my work shift | Allows the guard to view the list of shifts for a selected day. |
| 70 | View work shift Detail | View work shift detail | Allows the guard to view the details of a shift including the list of assigned guards. |
| 71 | Check-in work shift | Check-in work shift | Allows the guard to attend a shift by capturing a selfie photo via the device camera. |
| 72 | Request Shift Substitute | Request Shift Substitute (Popup) | Allows the guard to submit a request for a shift substitute. |
| 73 | View Personal Guard Profile | view personal guard profile | Allows the guard to view and update their personal profile. |
| | **--- ADMIN ACTOR ---** | | |
| 74 | Admin Dashboard | Dashboard | Allows the admin to view system-wide statistics including revenue, company counts, and recent activities. |
| 75 | View Companies By Admin | View Companies | Allows the admin to view and browse all registered security companies. |
| 76 | View Company Details (Admin) | Company Detail (Popup) | Allows the admin to view detailed information of a registered company. |
| 77 | View Registrations | View Registrations | Allows the admin to view the list of pending company registration requests. |
| 78 | View Registrations Detail | View Registrations Detail | Allows the admin to review a company registration request. |
| 79 | Approve/Reject Company | Approve/Reject Company (Popup) | Allows the admin to approve or reject a company registration request. |
| 80 | View Publish Request list | View Publish Request list | Allows the admin to view all requests from companies to be published on the marketplace. |
| 81 | View Publish Request Detail | View Publish Request Detail | Allows the admin to review a publish request. |
| 82 | Approve/Reject publish request | Approve/Reject publish request (Popup) | Allows the admin to approve or reject a publish request. |
| 83 | View Accounts | View Account | Allows the admin to view and search all user accounts in the system. |
| 84 | View Account Detail | View Account Detail | Allows the admin to view account details. |
| 85 | Ban Account | Ban Account (Popup) | Allows the admin to perform ban or unban actions on user accounts. |
| 86 | View Plans By Admin | Service Package Management | Allows the admin to view and manage SaaS subscription plans. |
| 87 | Add Plan | Add Plan (Popup) | Allows the admin to create a new SaaS subscription plan. |
| 88 | Update Plan | Update Plan (Popup) | Allows the admin to update an existing SaaS subscription plan. |
| 89 | Delete Plan | Delete Plan (Popup) | Allows the admin to delete a SaaS subscription plan. |
| 90 | View Services | View Services | Allows the admin to manage the global catalog of security service types. |
| 91 | Add Services | Add Services (Popup) | Allows the admin to add a new security service type to the catalog. |
| 92 | Update Services | Update Services (Popup) | Allows the admin to update a security service type. |
| 93 | Delete Services | Delete Services (Popup) | Allows the admin to delete a security service type from the catalog. |
| 94 | View Payment history | View Subscription Payments | Allows the admin to view SaaS payment transaction history across all companies. |
| 95 | View Bank Account | View Bank Account | Allows the admin to view bank accounts used to receive payments. |
| 96 | Add Bank Account | Add Bank Account (Popup) | Allows the admin to add a new bank account. |
| 97 | Update Bank Account | Update Bank Account (Popup) | Allows the admin to update bank account information. |
| 98 | Delete Bank Account | Delete Bank Account (Popup) | Allows the admin to delete a bank account. |


---

## Sequential List Format (Grouped by Actor)

### GUEST ACTOR

1
View Top rated companies
Home
Allows users to view the top 4 highest-rated security companies on the home page, sorted automatically by average customer rating.

2
View Companies
View Companies
Allows users to browse and search security companies on the marketplace.

3
View Company Details
View Company Details
Allows users to view detailed information of a security company including its profile, services, and customer reviews.

4
Compare companies
Compare Companies
Allows users to compare basic information of selected security companies such as ratings, completed contracts, years of operation, address, and services.

5
Register company
Register Company
Allows customers to submit an initial registration form for a new security company.

6
Register
Register
Allows guests to create a new account using email and password.

7
Login
Login
Allows users to sign in to the system with their credentials.

8
Email verification
Email verification
Allows users to verify their email address after registration.

9
Forgot password
Forgot password
Allows users to request a password reset link via email.

### CUSTOMER ACTOR

10
View Profile Detail
View Profile Detail
Allows all authenticated users to view and update their personal profile information.

11
Reset Password
Reset Password (Popup)
Allows users to set a new password after receiving the reset link.

12
Send Service request
Send Service request (Popup)
Allows the customer to submit a new service request to a security company.

13
view my requests
View my requests
Allows the customer to view all service requests they have submitted.

14
view my request detail
View my request detail
Allows the customer to view request details and review the company's quotation.

15
Confirm/Deny quotation (customer)
Confirm/Deny quotation (Popup)
Allows the customer to review and confirm or deny the company's quotation.

16
View My Contracts
View My Contract
Allows the customer to view all their contracts with security companies.

17
View My Contract Detail
View My Contract Detail
Allows the customer to view contract details.

18
Confirm Contract By Customer
Confirm Contract By Customer (Popup)
Allows the customer to confirm the contract.

19
Complete Contract (customer)
Complete Contract (Popup)
Allows the customer to mark an active contract as completed.

20
View Contract Shift Schedule
View contract shift schedule
Allows the customer to view the shift schedule of guards assigned to their contract.

21
Send Service Review
Send Service Review (Popup)
Allows the customer to rate and submit a review for a completed service.

22
View my reports
View my reports
Allows the customer to view incident reports they have submitted.

23
Submit report
Submit report (Popup)
Allows the customer to submit an incident report.

24
View my report detail
View my report detail
Allows the customer to view details of a submitted incident report.

25
View register request
View register request
Allows the customer to track the approval status of their submitted company registration.

26
Chat with company
Chat with company (Popup)
Allows the customer to send and receive real-time messages with the security company.

### COMPANY ADMIN ACTOR

27
Company Dashboard
Dashboard
Allows the company admin to view an overview of company activity including contracts, requests, and revenue.

28
View Company Profile (Company)
View Company Profile
Allows the company admin to view and edit company information.

29
Add Company Service
Add Company Service (Popup)
Allows the company admin to add new services to the company profile.

30
Send Publish Request
Send Publish Request (Popup)
Allows the company admin to submit a request to publish the company on the marketplace.

31
View and Manage Subscription
View and Manage Subscription
Allows the company admin to view the current subscription plan and access renewal options.

32
Pay SaaS Plan
Pay SaaS Plan
Allows the company admin to pay for a SaaS subscription plan via VietQR code.

33
View Coordinator List
View Coordinators
Allows the company admin to view all coordinators belonging to the company.

34
View Coordinator detail
View Coordinator detail
Allows the company admin to view a coordinator's profile and update their information.

35
Create Coordinator Account
Create Coordinator Account
Allows the company admin to create a new coordinator account.

36
View Contracts
View Contracts
Allows the company admin to view all contracts with customers.

37
View Contract Detail
View Contract Detail
Allows the company admin to view contract details and physical contract files.

38
Upload Physical Contract
Upload Physical Contract (Popup)
Allows the company admin to upload the physical signed contract file.

39
Confirm Contract By Company
Confirm Contract By Company (Popup)
Allows the company admin to confirm the contract.

40
Export Contract
Export Contract (Popup)
Allows the company admin or coordinator to export the contract document file.

41
view requests
View requests
Allows the company admin to view all service requests received from customers.

42
view request detail
View request detail
Allows the company admin to view details of a customer service request.

43
Update service quotation (company)
Update service quotation (Popup)
Allows the company admin to update and send the service quotation to the customer.

44
Reject Service Request
Reject Service Request (Popup)
Allows the company admin to reject a service request.

45
View Request Verifications
View Request Verifications
Allows the company admin to view all service request verifications.

46
View Request Verification Detail
View Request Verification Detail
Allows the company admin to review the details of a service request verification.

47
Approve/Reject Request Verification
Approve/Reject Request Verification (Popup)
Allows the company admin to approve or reject a service request verification.

48
View Review list (Company)
View Review list
Allows the company admin to view all customer reviews submitted for the company.

49
Chat with customer
Chat with customer
Allows the company admin to send and receive real-time messages with customers.

### COORDINATOR ACTOR

50
Coordinator Dashboard
Dashboard
Allows the coordinator to view an overview of their assigned responsibilities and shift activity.

51
View Guards
View Guards
Allows the coordinator to view and search all security guards under their management.

52
View guard detail
View guard detail
Allows the coordinator to view a guard's profile and update their information.

53
Create Guard Account
Create Guard Account (Popup)
Allows the coordinator to create a new guard account.

54
Approve/Reject guard profile
Approve/Reject guard profile (Popup)
Allows the coordinator to review and approve or reject a guard profile.

55
View Guard Performance
View Guard Performance
Allows the coordinator to view attendance and check-in performance statistics for each guard.

56
View work shifts
View work shifts
Allows the coordinator to view work shift schedules.

57
Create work shift
Create work shift (Popup)
Allows the coordinator to create and manage work shift schedules and assign guards.

58
Dispatch replacement guard
Dispatch replacement guard (Popup)
Allows the coordinator to assign a replacement guard to a shift.

59
View Shift Substitute Requests
View Shift Substitute Request
Allows the coordinator to view shift substitute requests submitted by guards.

60
Approve/Reject shift Substitute
Approve/Reject shift Substitute (Popup)
Allows the coordinator to approve or reject a shift substitute request.

61
View reports
View reports
Allows the coordinator to view submitted incident reports.

62
Update reports
Update reports (Popup)
Allows the coordinator to update the status and notes of an incident report.

63
View Request Verifications (Coor)
View Request Verifications
Allows the coordinator to view service request verifications assigned to them.

64
View Request Verification Detail (Coor)
View Request Verification Detail
Allows the coordinator to review the details of an assigned service request verification.

65
Update Request Verification
Update Request Verification (Popup)
Allows the coordinator to update findings and details of a service request verification.

66
View Bookings
View Bookings
Allows the coordinator to view bookings and contracts assigned to their team.

67
View Booking Detail
View Booking Detail
Allows the coordinator to view the details of an assigned booking.

### GUARD ACTOR

68
View shift schedule
View shift schedule
Allows the guard to view their weekly shift calendar.

69
View my work shift
View my work shift
Allows the guard to view the list of shifts for a selected day.

70
View work shift Detail
View work shift detail
Allows the guard to view the details of a shift including the list of assigned guards.

71
Check-in work shift
Check-in work shift
Allows the guard to attend a shift by capturing a selfie photo via the device camera.

72
Request Shift Substitute
Request Shift Substitute (Popup)
Allows the guard to submit a request for a shift substitute.

73
View Personal Guard Profile
view personal guard profile
Allows the guard to view and update their personal profile.

### ADMIN ACTOR

74
Admin Dashboard
Dashboard
Allows the admin to view system-wide statistics including revenue, company counts, and recent activities.

75
View Companies By Admin
View Companies
Allows the admin to view and browse all registered security companies.

76
View Company Details (Admin)
Company Detail (Popup)
Allows the admin to view detailed information of a registered company.

77
View Registrations
View Registrations
Allows the admin to view the list of pending company registration requests.

78
View Registrations Detail
View Registrations Detail
Allows the admin to review a company registration request.

79
Approve/Reject Company
Approve/Reject Company (Popup)
Allows the admin to approve or reject a company registration request.

80
View Publish Request list
View Publish Request list
Allows the admin to view all requests from companies to be published on the marketplace.

81
View Publish Request Detail
View Publish Request Detail
Allows the admin to review a publish request.

82
Approve/Reject publish request
Approve/Reject publish request (Popup)
Allows the admin to approve or reject a publish request.

83
View Accounts
View Account
Allows the admin to view and search all user accounts in the system.

84
View Account Detail
View Account Detail
Allows the admin to view account details.

85
Ban Account
Ban Account (Popup)
Allows the admin to perform ban or unban actions on user accounts.

86
View Plans By Admin
Service Package Management
Allows the admin to view and manage SaaS subscription plans.

87
Add Plan
Add Plan (Popup)
Allows the admin to create a new SaaS subscription plan.

88
Update Plan
Update Plan (Popup)
Allows the admin to update an existing SaaS subscription plan.

89
Delete Plan
Delete Plan (Popup)
Allows the admin to delete a SaaS subscription plan.

90
View Services
View Services
Allows the admin to manage the global catalog of security service types.

91
Add Services
Add Services (Popup)
Allows the admin to add a new security service type to the catalog.

92
Update Services
Update Services (Popup)
Allows the admin to update a security service type.

93
Delete Services
Delete Services (Popup)
Allows the admin to delete a security service type from the catalog.

94
View Payment history
View Subscription Payments
Allows the admin to view SaaS payment transaction history across all companies.

95
View Bank Account
View Bank Account
Allows the admin to view bank accounts used to receive payments.

96
Add Bank Account
Add Bank Account (Popup)
Allows the admin to add a new bank account.

97
Update Bank Account
Update Bank Account (Popup)
Allows the admin to update bank account information.

98
Delete Bank Account
Delete Bank Account (Popup)
Allows the admin to delete a bank account.

