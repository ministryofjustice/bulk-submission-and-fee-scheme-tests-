@bulkSubmission
Feature: Invalid submission level validation

  Background:
    Given I am on the bulk import page

  Scenario: Verify all mandatory field errors are displayed for an invalid XML upload Legal Help
    When I upload "tests/data/invalid/Legal_Help_Required_Field_Validation.xml"
    Then I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "LEGAL HELP":
      | Error Message                                                                                 |
      | uniqueFileNumber is required for area of law: LEGAL HELP                                      |
      | clientForename is required for area of law: LEGAL HELP                                        |
      | clientSurname is required for area of law: LEGAL HELP                                         |
      | clientPostcode is required for area of law: LEGAL HELP                                        |
      | genderCode is required for area of law: LEGAL HELP                                            |
      | ethnicityCode is required for area of law: LEGAL HELP                                         |
      | disabilityCode is required for area of law: LEGAL HELP                                        |
      | caseReferenceNumber is required for area of law: LEGAL HELP                                   |
      | scheduleReference is required for area of law: LEGAL HELP                                     |
      | Invalid date value for Case Concluded Date (Must be between 1995-01-01 and today): 2058-09-02 |