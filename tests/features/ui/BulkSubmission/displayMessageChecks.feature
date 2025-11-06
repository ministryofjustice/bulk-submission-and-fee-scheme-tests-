@bulkSubmission
@temp
Feature: Display message checks

  Background:
    Given I am on the bulk import page

  Scenario: Should check display messages are shown for format based errors (regex)
    Given I generate "Legal help" "csv" file with "1" outcomes
    When I upload "tests/data/invalid/legal_help_regex_errors.csv"
    And I upload the generated file and wait for import in progress
    Then I should see the following submission error messages for "Legal help":
      | Stage Reached Code must be exactly 2 alphanumeric characters for Civil claims |
