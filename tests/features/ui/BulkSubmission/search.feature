@bulkSubmission
Feature: Bulk Submission Search

#  Scenario Outline: Search For Valid/Invalid claims using submission ref
#    Given I ensure there is a "<Status>" submission for "<AreaOfLaw>"
#    And I am on the Search page
#    When I search using the most recent submission reference
#    Then I should see one search result for that submission
#    Then the Search page should pass accessibility checks
#    Examples:
#      | Status               | AreaOfLaw   |
#      | VALIDATION_FAILED    | LEGAL HELP  |
#      | VALIDATION_FAILED    | MEDIATION   |
#      | VALIDATION_FAILED    | CRIME LOWER |
#      | VALIDATION_SUCCEEDED | LEGAL HELP  |
#      | VALIDATION_SUCCEEDED | CRIME LOWER |
#      | VALIDATION_SUCCEEDED | MEDIATION   |


  Scenario: Validate error message when searching with an invalid submission reference
    Given I am on the Search page
    When I search using an invalid submission reference
    Then I should see a validation message saying "Enter a valid submission reference"
    Then the Search page should pass accessibility checks

#
#  Scenario Outline: Validate error messages for invalid search inputs
#    Given I am on the Search page
#    When I enter invalid search criteria:
#      | field               | value       |
#      | submissionReference | <reference> |
#      | fromDate            | <fromDate>  |
#      | toDate              | <toDate>    |
#    And I click search
#    Then I should see the following validation messages:
#      | <expectedMessage1> |
#      | <expectedMessage2> |
#    Then the Search page should pass accessibility checks
#    Examples:
#      | reference         | fromDate   | toDate     | expectedMessage1                                                             | expectedMessage2                                                           |
#      | 1234-invalid-uuid |            |            | Enter a valid submission reference                                           |                                                                            |
#      |                   | 32/13/2025 |            | Enter the submission from date in the correct format, for example, 17/5/2024 |                                                                            |
#      |                   |            | 99/99/2025 | Enter the submission to date in the correct format, for example, 17/5/2024   |                                                                            |
#      |                   | 40/15/2025 | 31/31/2025 | Enter the submission from date in the correct format, for example, 17/5/2024 | Enter the submission to date in the correct format, for example, 17/5/2024 |
#
#
#  Scenario: Search for submissions using valid date range
#    Given I determine a valid submission search date range for the past 1 days
#    And I am on the Search page
#    When I search using the valid date range
#    Then the Search page should pass accessibility checks
#    Then I should see results matching the expected count
#
#
#  Scenario: Verify future dates are disabled in the date pickers
#    Given I am on the Search page
#    Then future dates should be disabled in the "from" date picker
#    And future dates should be disabled in the "to" date picker
#
#
#  Scenario: Search with a past date range that returns no submissions
#    Given I choose a date in the past with no submissions
#    And I am on the Search page
#    When I search using the valid date range
#    Then I should see a message saying "No submissions were found."
#    Then the Search page should pass accessibility checks
