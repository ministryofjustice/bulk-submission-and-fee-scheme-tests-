@search @stable @jamie
Feature: Bulk Submission Search

  Background:
    And I start from a clean logged-in state

  @inputValidation
  Scenario: Validate error message when searching with an invalid submission reference
    Given I am on the Search page
    When I search using an invalid submission reference
    Then I should see a validation message saying "Enter a valid submission reference"
    Then the Search page should pass accessibility checks


  @inputValidation
  Scenario Outline: Validate error messages for invalid search inputs
    Given I am on the Search page
    When I enter invalid search criteria:
      | field               | value       |
      | submissionReference | <reference> |
      | fromDate            | <fromDate>  |
      | toDate              | <toDate>    |
    And I click search
    Then I should see the following validation messages:
      | <expectedMessage1> |
      | <expectedMessage2> |
    Then the Search page should pass accessibility checks
    Examples:
      | reference         | fromDate   | toDate     | expectedMessage1                                                             | expectedMessage2                                                           |
      | 1234-invalid-uuid |            |            | Enter a valid submission reference                                           |                                                                            |
      |                   | 32/13/2025 |            | Enter the submission from date in the correct format, for example, 17/5/2024 |                                                                            |
      |                   |            | 99/99/2025 | Enter the submission to date in the correct format, for example, 17/5/2024   |                                                                            |
      |                   | 40/15/2025 | 31/31/2025 | Enter the submission from date in the correct format, for example, 17/5/2024 | Enter the submission to date in the correct format, for example, 17/5/2024 |

    # TODO Enter no offices

  Scenario: Search with no filter specified
    Given I am on the Search page
    When I click search
    Then I should see search results