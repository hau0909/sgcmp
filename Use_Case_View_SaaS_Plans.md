# Use Case Specification: View SaaS Plans

**UC ID and Name:** UC-BILL-01 - View SaaS Plans
**Created By:** Haund
**Date Created:** 26/06/2026
**Primary Actor:** Company Admin
**Secondary Actors:** None

**Trigger:**
The Company Admin selects the billing or subscription management option in the system navigation.

**Description:**
The Company Admin views details of their current subscription plan, list of available SaaS plans, and payment history.

**Preconditions:**

- **PRE-01:** The user is logged into the system.
- **PRE-02:** The user is associated with a valid company account.

**Post-conditions:**

- **POST-01:** The system displays the current subscription status, available plans, and transaction history.

**Normal Flow:**
**A. View Billing and Subscription Details Successfully**

1. The Company Admin accesses the billing section.
2. The system checks the active company context. [Refer to **BR-01**]
3. The system retrieves and displays the current subscription plan details. [Refer to **BR-02**, **BR-03**]
4. The system retrieves and displays the list of other available subscription plans.
5. The system retrieves and displays the company's transaction history.
6. The Company Admin views the displayed information.

**Alternative Flows:**

**A.2 Company account not found**
1. The system displays a warning message that the company account profile is missing. [Refer to **MSG01**]
2. The use case ends.

**A.3 Company has no active subscription plan**
1. The system shows that there is no active subscription plan.
2. The system displays options to subscribe to available plans.
3. The Company Admin selects a plan and clicks the subscription button.
4. The system initializes the payment process. [Refer to **BR-04**]
5. The system redirects the Company Admin to the payment instructions.

**A.3a Payment initialization failed**
1. The system displays a transaction error message. [Refer to **MSG03**]
2. The system returns to step A.3.2.

**A.3b Company has an active subscription plan**
1. The system disables direct registration for other plans. [Refer to **BR-02**]
2. The system displays a contact option for plan upgrades or changes. [Refer to **BR-05**]
3. The Company Admin selects the contact option to request plan modifications.

**A.5 Transaction history is empty**
1. The system displays a notice indicating that no payment history is available. [Refer to **MSG05**]

**Exceptions:**

- **EX-01:** Server or network connection failure during data retrieval
  1. The system displays a system error message. [Refer to **MSG04**]

**Priority:** High
**Frequency of Use:** Medium
**Business Rules:** BR-01, BR-02, BR-03, BR-04, BR-05
**Other Information:** N/A
**Assumptions:** N/A
