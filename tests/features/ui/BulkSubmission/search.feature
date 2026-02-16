@search @stable @jamie
Feature: Bulk Submission Search

  Background:
    And I start from a clean logged-in state

  Scenario: Search for submissions via all fields
    Given I determine a valid submission search criteria
    And I am on the Search page
    When I search using the valid search criteria
    Then the Search page should pass accessibility checks
    Then I should see results matching the expected count

  @inputValidation
  Scenario: Validate office is selected
    Given I determine a valid submission search criteria
    And I am on the Search page
    When I deselect all office accounts
    And I click search
    Then I should see the following validation messages:
      | You must select an office account |

  #@inputValidation
  #Scenario Outline: Validate error messages for invalid search inputs
  #  Given I am on the Search page
  #  When I enter invalid search criteria:
  #    | field               | value       |
  #    | submissionReference | <reference> |
  #    | fromDate            | <fromDate>  |
  #    | toDate              | <toDate>    |
  #  And I click search
  #  Then I should see the following validation messages:
  #    | <expectedMessage1> |
  #    | <expectedMessage2> |
  #  Then the Search page should pass accessibility checks
  #  Examples:
  #    | reference         | fromDate   | toDate     | expectedMessage1                                                             | expectedMessage2                                                           |
  #    | 1234-invalid-uuid |            |            | Enter a valid submission reference                                           |                                                                            |
  #    |                   | 32/13/2025 |            | Enter the submission from date in the correct format, for example, 17/5/2024 |                                                                            |
  #    |                   |            | 99/99/2025 | Enter the submission to date in the correct format, for example, 17/5/2024   |                                                                            |
  #    |                   | 40/15/2025 | 31/31/2025 | Enter the submission from date in the correct format, for example, 17/5/2024 | Enter the submission to date in the correct format, for example, 17/5/2024 |


  #Scenario: Search for submissions using valid date range
  #  Given I determine a valid submission search date range for the past 1 days
  #  And I am on the Search page
  #  When I search using the valid date range
  #  Then the Search page should pass accessibility checks
  #  Then I should see results matching the expected count


  #Scenario: Verify future dates are disabled in the date pickers
  #  Given I am on the Search page

  #Scenario: Search with a past date range that returns no submissions
  #  Given I choose a date in the past with no submissions
  #  And I am on the Search page
  #  When I search using the valid date range
  #  Then I should see a message saying "No submissions were found."
  #  Then the Search page should pass accessibility checks

  #Scenario: Search with no filter specified
  #  Given I am on the Search page
  #  When I click search
  #  Then I should see search results