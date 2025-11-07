@bulkSubmission @smoke
Feature: Bulk Submission Upload Validation

  Background:
    Given I am on the bulk import page

  Scenario: Upload fails with an empty file
    Given I have generated an "empty" bulk submission file named "emptyFile.csv"
    When I upload that file
    Then the user sees an error message "The uploaded file is empty"

  Scenario: Upload fails when no file is attached
    When I click upload without attaching a file
    Then the user sees an error message "Select a file to upload"

  Scenario: Upload fails with an invalid file type
    Given I have generated an "invalid" bulk submission file named "invalid.docx"
    When I upload that file
    Then the user sees an error message "Choose an XML, CSV, or TXT file"

  Scenario: Upload fails with a file larger than 10MB
    Given I have generated an "large" bulk submission file named "largeFile.csv"
    When I upload that file
    Then the user sees an error message "File must be less than or equal to 10MB"

  Scenario: Upload fails with restricted office access
    Given I have generated an "restricted" bulk submission file named "officeRestriction.csv"
    When I upload that file
    Then the user sees an error message "User does not have authorisation to submit for office 0E525U. Please verify your office code and access permissions."

  Scenario: Upload fails with Invalid Area of Law
    When I upload "tests/data/invalid/invalidAreaOfLaw.csv"
    Then the user sees an error message "Area of Law must be one of: MEDIATION, CRIME LOWER, or LEGAL HELP"