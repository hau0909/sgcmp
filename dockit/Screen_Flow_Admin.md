flowchart TD
    %% ── 1. TOP SECTOR (ABOVE DASHBOARD) ────────────────────
    CompanyManagement[Company Management]
    RegistrationManagement[Registration Management]

    CompanyManagement <-- "Click on Companies Menu" --- Dashboard
    RegistrationManagement <-- "Click on Approvals Menu" --- Dashboard

    %% ── 2. CENTER HUB & LEFT / RIGHT ───────────────────────
    Login[Login Page] -->|"Click on Login Button"| Dashboard[Dashboard]
    Dashboard -->|"Click on Logout Button"| Login

    AccountManagement[Account Management]
    ServicePackageManagement[Service Package Management]

    PublishRequestManagement[Publish Request Management]
    PaymentHistory[Payment History]

    Dashboard -->|"Click on Publish Requests Menu"| PublishRequestManagement
    Dashboard -->|"Click on Payment History Menu"| PaymentHistory

    Dashboard -->|"Click on Accounts Menu"| AccountManagement
    Dashboard -->|"Click on Service Packages Menu"| ServicePackageManagement

    %% ── 3. BOTTOM SECTOR (BELOW DASHBOARD) ─────────────────
    ServiceManagement[Service Management]
    BankAccountManagement[Bank Account Management]

    Dashboard -->|"Click on Services Menu"| ServiceManagement
    Dashboard -->|"Click on Bank Accounts Menu"| BankAccountManagement

    %% ── 4. OUTWARD BRANCHES (DETAILS & MODALS) ──────────────

    %% Top Branches
    CompanyManagement -->|"Click on View Detail Row"| CompanyDetailModal(["Company Detail Modal"])

    RegistrationManagement -->|"Click on View Detail Row"| RegistrationDetail[Registration Detail]
    RegistrationDetail -->|"Click on Back Button"| RegistrationManagement
    RegistrationDetail -->|"Click on Approve Button"| ApproveRegistrationModal(["Approve Confirm Modal"])
    RegistrationDetail -->|"Click on Reject Button"| RejectRegistrationModal(["Reject Reason Modal"])
    RegistrationDetail -->|"Click on View Images Button"| RegistrationImagesModal(["View Images Modal"])

    %% Right Branches
    PublishRequestManagement -->|"Click on View Detail Row"| PublishRequestDetail[Publish Request Detail]
    PublishRequestDetail -->|"Click on Back Button"| PublishRequestManagement
    PublishRequestDetail -->|"Click on Approve Button"| ApprovePublishModal(["Approve Confirm Modal"])
    PublishRequestDetail -->|"Click on Reject Button"| RejectPublishModal(["Reject Reason Modal"])
    PublishRequestDetail -->|"Click on View Images Button"| PublishImagesModal(["View Images Modal"])

    PaymentHistory -->|"Click on Filter & Search"| PaymentHistory

    %% Bottom Branches
    ServiceManagement -->|"Click on Add Service Button"| ServiceAddDialog(["Add Service Form Dialog"])
    ServiceManagement -->|"Click on Edit Service Button"| ServiceEditDialog(["Edit Service Form Dialog"])
    ServiceManagement -->|"Click on Delete Service Button"| ServiceDeleteConfirm(["Delete Service Confirm Modal"])

    BankAccountManagement -->|"Click on Add Account Button"| BankAddDialog(["Add Bank Account Dialog"])
    BankAccountManagement -->|"Click on Edit Account Button"| BankEditDialog(["Edit Bank Account Dialog"])
    BankAccountManagement -->|"Click on Delete Account Button"| BankDeleteConfirm(["Delete Bank Account Confirm Modal"])
    BankAccountManagement -->|"Click on Toggle Status Button"| BankAccountManagement

    %% Left Branches
    AccountManagement -->|"Click on View Detail Row"| AccountDetail[Account Detail]
    AccountDetail -->|"Click on Back Button"| AccountManagement
    AccountDetail -->|"Click on Ban Account Button"| BanConfirmModal(["Ban Confirm Modal"])

    ServicePackageManagement -->|"Click on Add Package Button"| PlanAddDialog(["Add Package Form Dialog"])
    ServicePackageManagement -->|"Click on Edit Package Button"| PlanEditDialog(["Edit Package Form Dialog"])
    ServicePackageManagement -->|"Click on Delete Package Button"| PlanDeleteConfirm(["Delete Package Confirm Modal"])

    %% ── STYLES ─────────────────────────────────────────────
    classDef entry fill:#e2e8f0,stroke:#64748b,color:#1e293b,font-weight:bold
    classDef dashboard fill:#2c5ead,stroke:#024594,color:#fff,font-weight:bold
    classDef management fill:#dbeafe,stroke:#2563eb,color:#1e3a5f,font-weight:bold
    classDef detail fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e,font-weight:bold
    classDef popup fill:#fef9c3,stroke:#ca8a04,color:#713f12,font-weight:bold

    class Login entry
    class Dashboard dashboard
    class CompanyManagement,RegistrationManagement,PublishRequestManagement,PaymentHistory,ServiceManagement,BankAccountManagement,AccountManagement,ServicePackageManagement management
    class RegistrationDetail,PublishRequestDetail,AccountDetail detail
    class CompanyDetailModal,ApproveRegistrationModal,RejectRegistrationModal,RegistrationImagesModal,ApprovePublishModal,RejectPublishModal,PublishImagesModal,ServiceAddDialog,ServiceEditDialog,ServiceDeleteConfirm,BankAddDialog,BankEditDialog,BankDeleteConfirm,BanConfirmModal,PlanAddDialog,PlanEditDialog,PlanDeleteConfirm popup
