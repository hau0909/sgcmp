# Use Case Specification: Update Request Verification

**UC ID and Name:** UC-VER-04 - Update Request Verification
**Created By:** AI Assistant
**Date Created:** 21/07/2026
**Primary Actor:** Coordinator
**Secondary Actors:** None

**Trigger:**
The user edits the description or uploads/deletes images and clicks "Cập nhật thông tin khảo sát".

**Description:**
This use case allows a Coordinator to report the site status by updating the description and uploading related images for a pending or rejected verification.

**Preconditions:**
- **PRE-01:** The user is logged in as a Coordinator.
- **PRE-02:** The verification session is in "Pending" or "Rejected" status.

**Post-conditions:**
- **POST-01:** The verification details are updated in the system.

**Normal Flow (Luồng sự kiện chính):**
**A. Update Verification Info**
1. The user edits the description text.
2. The user drops or selects image files to upload, or clicks delete on existing images.
3. The user clicks "Cập nhật thông tin khảo sát".
4. The system uploads any new images to the storage and updates the verification record.
5. The system displays a success state and reloads the updated information.

**Alternative Flows (Luồng rẽ nhánh):**
N/A

**Exceptions (Ngoại lệ):**
- **EX-01:** Image Upload Failure
  1. The system fails to upload the image to the storage bucket.
  2. The system displays an upload error message.
- **EX-02:** Update Failure
  1. The system encounters an error while saving the data.
  2. The system displays MSG04.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01
**Other Information:** Admin cannot update descriptions/images.
**Assumptions:** N/A
